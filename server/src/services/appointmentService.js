import { prisma } from "../config/prisma.js";
import { classifyPriority, detectSchedulingConflicts, normalizePriority, priorityLabel } from "./conflictService.js";
import { createNotification, notifyAppointmentChange, simulateEmail } from "./notificationService.js";
import { writeAuditLog } from "./auditService.js";

const appointmentInclude = {
  client: { select: { id: true, name: true, email: true, phone: true } },
  lawyer: { include: { user: { select: { id: true, name: true, email: true } } } },
  // Simplified include for prototype: no documents/history tables
};

export async function createAppointment({ data, actor, req }) {
  const suggestedPriority = classifyPriority(data);
  const priority = normalizePriority(data.priority || suggestedPriority);
  const preferredStart = new Date(data.preferredStart);
  const preferredEnd = new Date(data.preferredEnd);
  const conflictScan = await detectSchedulingConflicts({
    lawyerId: data.lawyerId,
    start: preferredStart,
    end: preferredEnd,
    clientId: actor.role.slug === "client" ? actor.id : data.clientId || actor.id,
    consultationType: data.consultationType
  });

  const appointment = await prisma.appointment.create({
    data: {
      clientId: actor.role.slug === "client" ? actor.id : data.clientId || actor.id,
      lawyerId: data.lawyerId || null,
      consultationType: data.consultationType,
      subject: data.subject,
      description: data.description,
      priority,
      requestedPriority: data.priority || null,
      priorityReason: `Rule suggestion: ${priorityLabel(suggestedPriority)}. Selected priority: ${priorityLabel(priority)}.`,
      preferredStart,
      preferredEnd,
      scheduledStart: data.lawyerId && conflictScan.status !== "CONFLICT" ? preferredStart : null,
      scheduledEnd: data.lawyerId && conflictScan.status !== "CONFLICT" ? preferredEnd : null,
      locationMode: data.locationMode || "IN_PERSON",
      conflictStatus: conflictScan.status,
      // activity/history records are simplified for prototype; use audit logs and notifications
    },
    include: appointmentInclude
  });

  const staffRecipients = await prisma.user.findMany({
    where: { role: { slug: { in: ["staff", "admin"] } } },
    select: { id: true }
  });

  const staffNotifications = staffRecipients.map((recipient) =>
    createNotification({
      userId: recipient.id,
      title: "New appointment inquiry",
      message: `${appointment.client.name} submitted ${appointment.consultationType}.`,
      type: "APPOINTMENT",
      actionUrl: `/appointments?id=${appointment.id}`,
      metadata: { appointmentId: appointment.id, actorId: actor.id }
    })
  );

  await Promise.all([
    createNotification({
      userId: appointment.clientId,
      title: "Appointment inquiry received",
      message: "Your consultation request has been submitted for review.",
      type: "APPOINTMENT",
      actionUrl: `/appointments?id=${appointment.id}`,
      metadata: { appointmentId: appointment.id }
    }),
    ...staffNotifications,
    simulateEmail({
      to: appointment.client.email,
      subject: "Appointment inquiry received",
      body: `Your reference number is ${appointment.id}.`
    }),
    writeAuditLog({ req, userId: actor.id, action: "CREATE_APPOINTMENT", entity: "Appointment", entityId: appointment.id, metadata: { priority, suggestedPriority, conflictScan } })
  ]);

  return appointment;
}

export async function updateAppointmentStatus({ id, data, actor, req }) {
  const existing = await prisma.appointment.findUnique({
    where: { id },
    include: appointmentInclude
  });

  if (!existing) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }

  const scheduledStart = data.scheduledStart ? new Date(data.scheduledStart) : existing.scheduledStart;
  const scheduledEnd = data.scheduledEnd ? new Date(data.scheduledEnd) : existing.scheduledEnd;
  const lawyerId = data.lawyerId || existing.lawyerId;
  const conflictScan = await detectSchedulingConflicts({
    lawyerId,
    start: scheduledStart || existing.preferredStart,
    end: scheduledEnd || existing.preferredEnd,
    appointmentId: id,
    clientId: existing.clientId,
    consultationType: existing.consultationType
  });

  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      status: data.status,
      lawyerId,
      assignedById: actor.id,
      scheduledStart,
      scheduledEnd,
      conflictStatus: conflictScan.status,
      cancellationReason: data.status === "CANCELLED" ? data.reason : existing.cancellationReason,
      // history simplified; use notification + audit
    },
    include: appointmentInclude
  });

  await Promise.all([
    notifyAppointmentChange({
      appointment,
      actor,
      title: "Appointment status updated",
      message: `${appointment.subject} is now ${appointment.status}.`
    }),
    writeAuditLog({ req, userId: actor.id, action: "UPDATE_APPOINTMENT_STATUS", entity: "Appointment", entityId: id, metadata: { status: data.status, conflictScan } })
  ]);

  return appointment;
}

export async function rescheduleAppointment({ id, data, actor, req }) {
  const preferredStart = new Date(data.preferredStart);
  const preferredEnd = new Date(data.preferredEnd);
  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      preferredStart,
      preferredEnd,
      status: "RESCHEDULED",
      rescheduleReason: data.reason,
      // simplified: no history table
    },
    include: appointmentInclude
  });

  await writeAuditLog({ req, userId: actor.id, action: "RESCHEDULE_APPOINTMENT", entity: "Appointment", entityId: id });
  return appointment;
}

export async function cancelAppointment({ id, reason, actor, req }) {
  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancellationReason: reason,
      // simplified: no history table
    },
    include: appointmentInclude
  });

  await writeAuditLog({ req, userId: actor.id, action: "CANCEL_APPOINTMENT", entity: "Appointment", entityId: id });
  return appointment;
}

export { appointmentInclude };
