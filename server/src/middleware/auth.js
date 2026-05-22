import { prisma } from "../config/prisma.js";
import { cookieNames, getCookie } from "../utils/cookies.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { HttpError } from "../utils/httpError.js";
import { env } from "../config/env.js";

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    const bearerToken = header?.startsWith("Bearer ") ? header.slice(7) : null;
    const token = bearerToken || getCookie(req, cookieNames.access);

    if (env.nodeEnv !== "production") {
      // Lightweight debug info to help diagnose auth problems during local dev
      console.debug("[auth] incoming request", {
        path: req.path,
        method: req.method,
        ip: req.ip,
        cookies: req.headers.cookie,
        authHeader: header ? "present" : "absent",
        tokenSource: bearerToken ? "authorization_header" : (getCookie(req, cookieNames.access) ? "cookie" : "none")
      });
    }

    if (!token) {
      throw new HttpError(401, "Authentication token required");
    }

    const payload = verifyAccessToken(token);
    if (payload.type !== "access") {
      throw new HttpError(401, "Invalid token type");
    }
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true, lawyerProfile: true }
    });

    if (!user || user.status !== "ACTIVE") {
      if (env.nodeEnv !== "production") {
        console.debug("[auth] user lookup failed or inactive", { payloadSub: payload.sub, userFound: Boolean(user), status: user?.status });
      }
      throw new HttpError(401, "Invalid or inactive user");
    }

    if (env.nodeEnv !== "production") {
      console.debug("[auth] user authenticated", { id: user.id, role: user.role?.slug });
    }

    req.user = user;
    next();
  } catch (error) {
    if (env.nodeEnv !== "production") console.debug("[auth] authentication error", error && error.message ? error.message : error);
    next(error.statusCode ? error : new HttpError(401, "Invalid or expired token"));
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    const role = req.user?.role?.slug;
    if (!roles.includes(role)) {
      return next(new HttpError(403, "You do not have permission to perform this action"));
    }
    return next();
  };
}
