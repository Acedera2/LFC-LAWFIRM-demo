import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, "dev-data.json");
const raw = fs.readFileSync(dataPath, "utf8");
const store = JSON.parse(raw);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => res.json({ ok: true, now: new Date().toISOString() }));

app.get("/api/lawyers", (req, res) => {
  const docs = store.lawyers.map((l) => ({ ...l, user: store.users.find(u => u.id === l.userId) }));
  res.json(docs);
});

app.get("/api/appointments", (req, res) => {
  res.json(store.appointments);
});

app.post("/api/appointments", (req, res) => {
  const payload = req.body;
  const id = `appt_${Date.now()}`;
  const appt = { id, ...payload, createdAt: new Date().toISOString() };
  store.appointments.push(appt);
  res.status(201).json(appt);
});

app.post("/api/appointments/conflict-check", (req, res) => {
  const { lawyerId, preferredStart, preferredEnd } = req.body;
  const start = new Date(preferredStart);
  const end = new Date(preferredEnd);
  const appts = store.appointments.filter(a => a.lawyerId === lawyerId || !a.lawyerId);
  const conflict = appts.some(a => {
    const s = new Date(a.preferredStart || a.scheduledStart);
    const e = new Date(a.preferredEnd || a.scheduledEnd);
    return (start < e && end > s);
  });
  const availability = store.availability.filter(av => av.lawyerId === lawyerId).some(av => {
    const s = new Date(av.startsAt);
    const e = new Date(av.endsAt);
    return start >= s && end <= e;
  });
  res.json({ conflict, available: availability });
});

app.get("/api/notifications", (req, res) => {
  res.json(store.notifications);
});

app.patch("/api/appointments/:id/status", (req, res) => {
  const userId = req.cookies?.demo_user;
  const user = store.users.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ message: "Not authenticated" });
  const role = store.roles.find((r) => r.id === user.roleId)?.slug;

  if (!["staff", "admin"].includes(role)) return res.status(403).json({ message: "Forbidden" });

  const appt = store.appointments.find((a) => a.id === req.params.id);
  if (!appt) return res.status(404).send("Appointment not found");

  const { status, scheduledStart, scheduledEnd, lawyerId } = req.body || {};
  if (status) appt.status = status;
  if (scheduledStart) appt.scheduledStart = scheduledStart;
  if (scheduledEnd) appt.scheduledEnd = scheduledEnd;
  if (lawyerId) appt.lawyerId = lawyerId;

  res.json({ data: { appointment: appt } });
});

app.patch("/api/appointments/:id/accept", (req, res) => {
  const userId = req.cookies?.demo_user;
  const user = store.users.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ message: "Not authenticated" });
  const role = store.roles.find((r) => r.id === user.roleId)?.slug;

  if (role !== "lawyer") return res.status(403).json({ message: "Forbidden" });

  const lawyer = store.lawyers.find((l) => l.userId === user.id);
  const appt = store.appointments.find((a) => a.id === req.params.id);
  if (!appt) return res.status(404).send("Appointment not found");
  if (!lawyer || appt.lawyerId !== lawyer.id) return res.status(403).json({ message: "You are not assigned to this appointment" });

  appt.status = "CONFIRMED";
  appt.scheduledStart = appt.scheduledStart || appt.preferredStart;
  appt.scheduledEnd = appt.scheduledEnd || appt.preferredEnd;

  res.json({ data: { appointment: appt } });
});

app.delete("/api/appointments/:id", (req, res) => {
  const userId = req.cookies?.demo_user;
  const user = store.users.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ message: "Not authenticated" });
  const role = store.roles.find((r) => r.id === user.roleId)?.slug;

  const apptIndex = store.appointments.findIndex((a) => a.id === req.params.id);
  if (apptIndex === -1) return res.status(404).send("Appointment not found");
  const appt = store.appointments[apptIndex];

  // clients can cancel own appointment; staff/admin can cancel any
  if (role === "client" && appt.clientId !== user.id) return res.status(403).json({ message: "Forbidden" });

  // mark cancelled
  appt.status = "CANCELLED";
  appt.cancellationReason = req.body?.reason || "Cancelled via demo";

  res.json({ data: { appointment: appt } });
});

// Simple demo auth endpoints
function findUserByEmail(email) {
  return store.users.find(u => u.email.toLowerCase() === (email || "").toLowerCase());
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2);
}

function setAuthCookies(res, user) {
  // set demo session cookie and return user payload
  const cookieOpts = { httpOnly: true, secure: false, sameSite: 'lax', path: '/' };
  res.cookie('demo_user', user.id, cookieOpts);
  return { data: { user: { ...user, role: store.roles.find(r => r.id === user.roleId) } } };
}

function mountAuthRoutes(prefix = '') {
  app.get(`${prefix}/auth/csrf`, (req, res) => {
    const token = cryptoRandom();
    // CSRF cookie is readable by client-side JS
    res.cookie('lfc_csrf', encodeURIComponent(token), { httpOnly: false, secure: false, sameSite: 'lax', path: '/' });
    res.json({ data: { csrfToken: token } });
  });

  app.post(`${prefix}/auth/login`, (req, res) => {
    const { email, password } = req.body || {};
    const user = findUserByEmail(email);
    // demo password for seeded accounts is Password123!
    if (!user || password !== 'Password123!') {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json(setAuthCookies(res, user));
  });

  app.post(`${prefix}/auth/logout`, (req, res) => {
    res.clearCookie('demo_user');
    res.json({ message: 'Signed out' });
  });

  app.get(`${prefix}/auth/me`, (req, res) => {
    const userId = req.cookies?.demo_user;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });
    const user = store.users.find(u => u.id === userId);
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    res.json({ data: { user: { ...user, role: store.roles.find(r => r.id === user.roleId) } } });
  });
}

// mount auth routes at both root and /api for compatibility with client
mountAuthRoutes('');
mountAuthRoutes('/api');

const basePort = Number(process.env.PORT || 5000);
function listenWithRetry(app, port, attempts = 5) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`Demo server listening on port ${port}`);
      resolve(server);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && attempts > 0) {
        console.warn(`Port ${port} in use, trying ${port + 1}`);
        setTimeout(() => {
          listenWithRetry(app, port + 1, attempts - 1).then(resolve).catch(reject);
        }, 200);
      } else {
        reject(err);
      }
    });
  });
}

listenWithRetry(app, basePort).catch(err => {
  console.error('Failed to start demo server:', err);
  process.exit(1);
});
