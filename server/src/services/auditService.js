import { prisma } from "../config/prisma.js";

export async function writeAuditLog({ req, userId, action, entity, entityId, metadata = {} }) {
  try {
    if (prisma.auditLog && prisma.auditLog.create) {
      return await prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          metadata,
          ipAddress: req?.ip,
          userAgent: req?.headers?.["user-agent"]
        }
      });
    }
  } catch (err) {
    console.warn("Audit log skipped:", err?.message || err);
  }
  return null;
}
