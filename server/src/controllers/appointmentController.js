import { prisma } from "../config/prisma.js";
import { classifyPriority, detectSchedulingConflicts } from "../services/conflictService.js";
import { createAppointmentReceipt } from "../services/receiptService.js";
import { createAppointment, updateAppointmentStatus, rescheduleAppointment, cancelAppointment, appointmentInclude } from "../services/appointmentService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";
import { ok, created } from "../utils/response.js";

function scopedAppointmentWhere(user, query) {
  const role = user.role.slug;
  const where = {};

  if (role === "client") where.clientId = user.id;
  if (role === "lawyer") where.lawyerId = user.lawyerProfile?.id || "__none__";

  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.lawyerId && ["admin", "staff"].includes(role)) where.lawyerId = query.lawyerId;
  if (query.clientId && ["admin", "staff"].includes(role)) where.clientId = query.clientId;
  if (query.search) {
    where.OR = [
      { subject: { contains: query.search } },
      { consultationType: { contains: query.search } },
      { client: { name: { contains: query.search } } },
      { lawyer: { user: { name: { contains: query.search } } } }
    ];
  }

  return where;
}

function assertAppointmentAccess(user, appointment, action = "view") {
  const role = user.role.slug;
  if (["admin", "staff"].includes(role)) return;
  if (role === "client" && appointment.clientId === user.id) return;
  if (role === "lawyer" && appointment.lawyerId === user.lawyerProfile?.id) return;
  throw new HttpError(403, `You do not have permission to ${action} this appointment`);
}

export const listAppointments = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.validated.query);
  const query = req.validated.query;
  const where = scopedAppointmentWhere(req.user, query);
  const orderBy = { [query.sortBy || "createdAt"]: query.sortOrder || "desc" };

  const [items, total] = await Promise.all([
    prisma.appointment.findMany({ where, include: appointmentInclude, skip, take, orderBy }),
    prisma.appointment.count({ where })
  ]);

  ok(res, { appointments: items }, paginationMeta(total, page, limit));
});

export const create = asyncHandler(async (req, res) => {
  const appointment = await createAppointment({ data: req.validated.body, actor: req.user, req });
  created(res, { appointment });
});

export const getById = asyncHandler(async (req, res) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: req.params.id },
    include: appointmentInclude
  });
  if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  assertAppointmentAccess(req.user, appointment);
  ok(res, { appointment });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const existing = await prisma.appointment.findUnique({ where: { id: req.validated.params.id } });
  if (!existing) throw new HttpError(404, "Appointment not found");
  assertAppointmentAccess(req.user, existing, "update");
  const appointment = await updateAppointmentStatus({ id: req.validated.params.id, data: req.validated.body, actor: req.user, req });
  ok(res, { appointment });
});

export const reschedule = asyncHandler(async (req, res) => {
  const existing = await prisma.appointment.findUnique({ where: { id: req.validated.params.id } });
  if (!existing) throw new HttpError(404, "Appointment not found");
  assertAppointmentAccess(req.user, existing, "reschedule");
  const appointment = await rescheduleAppointment({ id: req.validated.params.id, data: req.validated.body, actor: req.user, req });
  ok(res, { appointment });
});

export const cancel = asyncHandler(async (req, res) => {
  const existing = await prisma.appointment.findUnique({ where: { id: req.validated.params.id } });
  if (!existing) throw new HttpError(404, "Appointment not found");
  assertAppointmentAccess(req.user, existing, "cancel");
  const appointment = await cancelAppointment({ id: req.validated.params.id, reason: req.validated.body.reason, actor: req.user, req });
  ok(res, { appointment });
});

export const conflictCheck = asyncHandler(async (req, res) => {
  const data = req.validated.body;
  const scan = await detectSchedulingConflicts({
    lawyerId: data.lawyerId,
    clientId: req.user.role.slug === "client" ? req.user.id : data.clientId,
    consultationType: data.consultationType,
    start: new Date(data.preferredStart),
    end: new Date(data.preferredEnd)
  });
  ok(res, {
    suggestedPriority: classifyPriority(data),
    conflictScan: scan
  });
});

export const receipt = asyncHandler(async (req, res) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: req.params.id },
    include: appointmentInclude
  });
  if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  assertAppointmentAccess(req.user, appointment);
  const pdf = await createAppointmentReceipt(appointment);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${appointment.id}-receipt.pdf"`);
  res.send(pdf);
});
