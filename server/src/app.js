import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { csrfProtection } from "./middleware/csrf.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiRateLimiter } from "./middleware/rateLimiter.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { sanitizeInput } from "./middleware/sanitize.js";
import routes from "./routes/index.js";

export const app = express();
const defaultOrigins = [
  env.clientUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
].filter(Boolean);

const allowedOrigins = new Set([...defaultOrigins, ...env.corsAllowedOrigins]);
const isLoopbackOrigin = (origin) => {
  if (env.nodeEnv === "production") return false;

  try {
    const url = new URL(origin);
    return url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
  } catch {
    return false;
  }
};

app.set("trust proxy", 1);
app.use(helmet());
app.use(compression());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin) || isLoopbackOrigin(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  credentials: true,
  maxAge: 600
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);
app.use(requestLogger);
app.use(apiRateLimiter);
app.use(csrfProtection);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "lfc-legal-appointment-system-api",
    timestamp: new Date().toISOString()
  });
});

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);
