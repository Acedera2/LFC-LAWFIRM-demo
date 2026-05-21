import { prisma } from "../config/prisma.js";

export async function writeActivityLog({ req, userId, action, summary, metadata = {} }) {
  try {
    if (prisma.activityLog && prisma.activityLog.create) {
      return await prisma.activityLog.create({
        data: {
          userId,
          action,
          summary,
          metadata,
          ipAddress: req?.ip,
          userAgent: req?.headers?.["user-agent"]
        }
      });
    }
  } catch (err) {
    // fail-open for prototype: do not block primary flows
    console.warn("Activity log skipped:", err?.message || err);
  }
  return null;
}
