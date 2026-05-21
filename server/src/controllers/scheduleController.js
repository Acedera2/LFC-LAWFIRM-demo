import { prisma } from "../config/prisma.js";
import { writeAuditLog } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { created, ok } from "../utils/response.js";

function resolveLawyerId(user, body) {
  if (user.role?.slug === "lawyer") return user.lawyerProfile?.id;
  return body.lawyerId;
}

export const listAvailability = asyncHandler(async (req, res) => {
  const where = req.user.role?.slug === "lawyer" ? { lawyerId: req.user.lawyerProfile?.id } : {};
  const availability = await prisma.availability.findMany({
    where,
    include: { lawyer: { include: { user: { select: { id: true, name: true } } } } },
    orderBy: { startsAt: "asc" },
    take: 200
  });
  ok(res, { availability });
});

export const createAvailability = asyncHandler(async (req, res) => {
  const lawyerId = resolveLawyerId(req.user, req.validated.body);
  if (!lawyerId) throw new HttpError(400, "Lawyer profile is required");

  const availability = await prisma.availability.create({
    data: {
      lawyerId,
      type: req.validated.body.type,
      startsAt: new Date(req.validated.body.startsAt),
      endsAt: new Date(req.validated.body.endsAt),
      reason: req.validated.body.reason
    }
  });

  await writeAuditLog({ req, userId: req.user.id, action: "CREATE_AVAILABILITY", entity: "Availability", entityId: availability.id });
  created(res, { availability });
});
