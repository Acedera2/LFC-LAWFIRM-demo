import { addMinutes, isBefore, parseISO } from "date-fns";
import { prisma } from "../config/prisma.js";

export function classifyPriority({ consultationType = "", description = "" }) {
  const content = `${consultationType} ${description}`.toLowerCase();
  if (/(emergency|urgent|court deadline|deadline|urgent filing|filing|injunction|hearing)/.test(content)) {
    return "URGENT";
  }
  if (/(ongoing|processing|follow-up|follow up|review|case update|compliance)/.test(content)) {
    return "MODERATE";
  }
  return "REGULAR";
}

export function priorityLabel(priority) {
  return {
    URGENT: "Urgent",
    MODERATE: "Moderate",
    REGULAR: "Regular"
  }[priority] || priority || "Regular";
}

export function normalizePriority(priority) {
  if (priority === "HIGH") return "URGENT";
  if (priority === "MEDIUM") return "MODERATE";
  return priority || "REGULAR";
}


function appointmentRange(start, end) {
  const startDate = typeof start === "string" ? parseISO(start) : start;
  const endDate = end ? (typeof end === "string" ? parseISO(end) : end) : addMinutes(startDate, 60);
  return { startDate, endDate };
}

async function isSlotAvailable({ lawyerId, startDate, endDate, appointmentId }) {
  const overlap = await prisma.appointment.count({
    where: {
      lawyerId,
      id: appointmentId ? { not: appointmentId } : undefined,
      status: { in: ["SCHEDULED", "APPROVED"] },
      scheduledStart: { lt: endDate },
      scheduledEnd: { gt: startDate }
    }
  });
  return overlap === 0;
}

export async function recommendAlternativeSchedules({ lawyerId, start, end, appointmentId, limit = 5 }) {
  if (!lawyerId || !start) return [];
  const { startDate, endDate } = appointmentRange(start, end);
  const durationMinutes = Math.max(30, Math.round((endDate.getTime() - startDate.getTime()) / 60000));
  const recommendations = [];

  // fetch future availability blocks for the lawyer
  const availBlocks = await prisma.availability.findMany({
    where: { lawyerId, endsAt: { gt: new Date() } },
    orderBy: { startsAt: "asc" }
  });

  for (const block of availBlocks) {
    if (recommendations.length >= limit) break;
    // iterate within the block by 30-minute steps
    let cursor = new Date(Math.max(block.startsAt.getTime(), startDate.getTime()));
    while (cursor.getTime() + durationMinutes * 60000 <= block.endsAt.getTime() && recommendations.length < limit) {
      const candidateStart = new Date(cursor);
      const candidateEnd = addMinutes(candidateStart, durationMinutes);
      if (isBefore(candidateStart, new Date())) {
        cursor = addMinutes(cursor, 30);
        continue;
      }

      const blocked = await prisma.availability.count({
        where: {
          lawyerId,
          type: { in: ["UNAVAILABLE", "RESERVED"] },
          startsAt: { lt: candidateEnd },
          endsAt: { gt: candidateStart }
        }
      });
      if (blocked > 0) {
        cursor = addMinutes(cursor, 30);
        continue;
      }

      if (await isSlotAvailable({ lawyerId, startDate: candidateStart, endDate: candidateEnd, appointmentId })) {
        recommendations.push({ startsAt: candidateStart, endsAt: candidateEnd, reason: "Available" });
      }

      cursor = addMinutes(cursor, 30);
    }
  }

  return recommendations.slice(0, limit);
}

export async function detectSchedulingConflicts({ lawyerId, start, end, appointmentId, clientId, consultationType }) {
  if (!lawyerId || !start) {
    return {
      status: "PENDING_ASSIGNMENT",
      conflicts: [],
      warnings: ["No lawyer assigned yet. Staff review required."],
      recommendations: []
    };
  }

  const { startDate, endDate } = appointmentRange(start, end);
  const maxAppointments = 8; // prototype default daily capacity per lawyer

  const [overlappingAppointments, sameDayCount, historicalCount, duplicateRequests, availabilityBlocks] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        lawyerId,
        id: appointmentId ? { not: appointmentId } : undefined,
        status: { in: ["SCHEDULED", "APPROVED"] },
        scheduledStart: { lt: endDate },
        scheduledEnd: { gt: startDate }
      },
      select: { id: true, subject: true, scheduledStart: true, scheduledEnd: true }
    }),
    prisma.appointment.count({
      where: {
        lawyerId,
        status: { in: ["SCHEDULED", "APPROVED", "COMPLETED"] },
        scheduledStart: {
          gte: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
          lt: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1)
        }
      }
    }),
    prisma.appointment.count({
      where: {
        lawyerId,
        status: { in: ["SCHEDULED", "APPROVED", "COMPLETED"] },
        scheduledStart: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    prisma.appointment.findMany({
      where: {
        id: appointmentId ? { not: appointmentId } : undefined,
        clientId,
        lawyerId,
        consultationType,
        status: { notIn: ["CANCELLED", "REJECTED", "COMPLETED"] },
        preferredStart: { gte: addMinutes(startDate, -15), lte: addMinutes(startDate, 15) },
        preferredEnd: { gte: addMinutes(endDate, -15), lte: addMinutes(endDate, 15) }
      },
      select: { id: true, subject: true, preferredStart: true, status: true }
    }),
    prisma.availability.findMany({
      where: {
        lawyerId,
        type: { in: ["UNAVAILABLE", "RESERVED"] },
        startsAt: { lt: endDate },
        endsAt: { gt: startDate }
      },
      select: { id: true, type: true, reason: true, startsAt: true, endsAt: true }
    })
  ]);

  const conflicts = [];
  const warnings = [];

  if (availabilityBlocks.length > 0) {
    conflicts.push({
      type: "UNAVAILABLE_LAWYER",
      message: "Selected lawyer has a reserved or unavailable block during this window.",
      availabilityBlocks
    });
  }

  if (overlappingAppointments.length > 0) {
    conflicts.push({
      type: "DOUBLE_BOOKING",
      message: "The requested window overlaps with an existing confirmed appointment.",
      appointments: overlappingAppointments
    });
  }

  if (duplicateRequests.length > 0) {
    conflicts.push({
      type: "DUPLICATE_REQUEST",
      message: "A similar appointment request already exists for this client, lawyer, and time window.",
      appointments: duplicateRequests
    });
  }

  if (sameDayCount >= 8) {
    warnings.push("Daily workload capacity has been reached for this lawyer.");
  } else if (sameDayCount >= 6) {
    warnings.push("Lawyer workload is approaching daily capacity.");
  }

  const dailyAverage = historicalCount / 30;
  if (sameDayCount > Math.max(4, dailyAverage * 1.4)) {
    warnings.push("Possible appointment congestion for this day.");
  }

  const status = conflicts.length ? "CONFLICT" : warnings.length ? "WARNING" : "CLEAR";
  const recommendations = status === "CLEAR"
    ? []
    : await recommendAlternativeSchedules({ lawyerId, start: startDate, end: endDate, appointmentId });

  return {
    status,
    conflicts,
    warnings,
    recommendations,
    metrics: {
        sameDayCount,
        maxAppointments,
        thirtyDayDailyAverage: Number(dailyAverage.toFixed(2))
    }
  };
}
