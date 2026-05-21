import crypto from "node:crypto";
import { writeActivityLog } from "../services/activityService.js";

export function requestLogger(req, res, next) {
  req.requestId = crypto.randomUUID();
  res.setHeader("X-Request-Id", req.requestId);

  res.on("finish", () => {
    if (req.path === "/health") return;
    if (res.statusCode >= 401) {
      writeActivityLog({
        req,
        userId: req.user?.id,
        action: res.statusCode === 401 ? "UNAUTHORIZED_ACCESS" : "REQUEST_REJECTED",
        summary: `${req.method} ${req.originalUrl} returned ${res.statusCode}`,
        metadata: { requestId: req.requestId, statusCode: res.statusCode }
      }).catch(() => {});
    }
  });

  next();
}
