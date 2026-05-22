import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, "dev-data.json");
let store = { lawyers: [], appointments: [], users: [], roles: [], notifications: [], availability: [] };
try {
  const raw = fs.readFileSync(dataPath, "utf8");
  store = JSON.parse(raw);
} catch (err) {
  console.warn(`dev-server: unable to read dev-data.json at ${dataPath}, starting with empty demo store`);
}

function roleBySlug(slug) {
  return store.roles.find((role) => role.slug === slug);
}

function generateSampleName(roleSlug, index) {
  const prefixes = {
    admin: "Admin User",
    staff: "Staff User",
    lawyer: "Attorney",
    client: "Client User"
  };

  return `${prefixes[roleSlug] || roleSlug} ${String(index).padStart(2, "0")}`;
}

function ensureUsersForRole(roleSlug, targetCount) {
  const role = roleBySlug(roleSlug);
  if (!role) return [];

  const existing = store.users.filter((user) => user.roleId === role.id);
  while (existing.length < targetCount) {
    const index = existing.length + 1;
    const name = generateSampleName(roleSlug, index);
    const id = `${roleSlug}_${String(index).padStart(3, "0")}`;
    const email = `${roleSlug}.${String(index).padStart(3, "0")}@demo.local`;
    const user = { id, roleId: role.id, name, email };
    store.users.push(user);
    existing.push(user);

    if (roleSlug === "lawyer") {
      const lawyerId = `lawyer_${String(index).padStart(3, "0")}`;
      store.lawyers.push({
        id: lawyerId,
        userId: user.id,
        barNumber: `BAR-${1000 + index}`,
        specialization: index % 2 === 0 ? "Family Law" : "Corporate Law",
        bio: `Demo lawyer profile ${index}.`,
        status: "ACTIVE"
      });
    }
  }

  return existing;
}

function ensureAvailabilityForLawyers() {
  const lawyers = store.lawyers;
  for (let index = 0; index < lawyers.length; index += 1) {
    const lawyer = lawyers[index];
    const baseDate = new Date(Date.UTC(2026, 4, 25, 8, 0, 0));
    baseDate.setUTCDate(baseDate.getUTCDate() + (index % 10));
    const startsMorning = new Date(baseDate);
    const endsMorning = new Date(baseDate);
    endsMorning.setUTCHours(12, 0, 0, 0);
    const startsAfternoon = new Date(baseDate);
    startsAfternoon.setUTCHours(13, 0, 0, 0);
    const endsAfternoon = new Date(baseDate);
    endsAfternoon.setUTCHours(17, 0, 0, 0);

    const existingSlots = store.availability.filter((item) => item.lawyerId === lawyer.id);
    if (existingSlots.length < 2) {
      store.availability.push(
        {
          id: `av_${lawyer.id}_am`,
          lawyerId: lawyer.id,
          type: "AVAILABLE",
          startsAt: startsMorning.toISOString(),
          endsAt: endsMorning.toISOString()
        },
        {
          id: `av_${lawyer.id}_pm`,
          lawyerId: lawyer.id,
          type: "AVAILABLE",
          startsAt: startsAfternoon.toISOString(),
          endsAt: endsAfternoon.toISOString()
        }
      );
    }
  }
}

function ensureAppointmentsAndNotifications() {
  const clients = store.users.filter((user) => user.roleId === roleBySlug("client")?.id);
  const lawyers = store.lawyers;
  const staffUsers = store.users.filter((user) => user.roleId === roleBySlug("staff")?.id);
  const adminUsers = store.users.filter((user) => user.roleId === roleBySlug("admin")?.id);

  const statusCycle = ["PENDING", "SCHEDULED", "APPROVED", "REJECTED", "RESCHEDULED", "CANCELLED", "COMPLETED"];
  while (store.appointments.length < 50 && clients.length > 0 && lawyers.length > 0) {
    const index = store.appointments.length + 1;
    const client = clients[(index - 1) % clients.length];
    const lawyer = lawyers[(index - 1) % lawyers.length];
    const status = statusCycle[(index - 1) % statusCycle.length];
    const start = new Date(Date.UTC(2026, 4, 25 + ((index - 1) % 5), 9 + ((index - 1) % 4), 0, 0));
    const end = new Date(start);
    end.setUTCMinutes(end.getUTCMinutes() + 30);

    store.appointments.push({
      id: `appt_demo_${String(index).padStart(3, "0")}`,
      clientId: client.id,
      lawyerId: lawyer.id,
      consultationType: index % 2 === 0 ? "General consultation" : "Court deadline preparation",
      subject: `Demo inquiry ${index}`,
      description: `Sample inquiry ${index} showing a live transaction through the workflow.`,
      priority: index % 3 === 0 ? "URGENT" : index % 2 === 0 ? "MODERATE" : "REGULAR",
      status,
      preferredStart: start.toISOString(),
      preferredEnd: end.toISOString(),
      scheduledStart: status === "PENDING" ? null : start.toISOString(),
      scheduledEnd: status === "PENDING" ? null : end.toISOString(),
      locationMode: index % 2 === 0 ? "IN_PERSON" : "PHONE",
      conflictStatus: status === "REJECTED" ? "CONFLICT" : "CLEAR"
    });
  }

  const notificationTargets = [...clients, ...staffUsers, ...store.lawyers.map((lawyer) => store.users.find((user) => user.id === lawyer.userId)).filter(Boolean), ...adminUsers];
  while (store.notifications.length < 50 && notificationTargets.length > 0) {
    const index = store.notifications.length + 1;
    const target = notificationTargets[(index - 1) % notificationTargets.length];
    store.notifications.push({
      id: `note_demo_${String(index).padStart(3, "0")}`,
      userId: target.id,
      title: `Workflow update ${index}`,
      message: `Demo notification ${index} showing appointment, review, or status movement inside the system.`,
      type: index % 4 === 0 ? "CONFLICT" : index % 3 === 0 ? "APPOINTMENT" : "info",
      readAt: index % 5 === 0 ? new Date().toISOString() : null
    });
  }

  const spotlightUsers = [
    store.users.find((user) => user.id === "user_admin"),
    store.users.find((user) => user.id === "user_staff"),
    store.users.find((user) => user.id === "user_lawyer_1"),
    store.users.find((user) => user.id === "user_client_1")
  ].filter(Boolean);

  for (const spotlightUser of spotlightUsers) {
    const existingForUser = () => store.notifications.filter((notification) => notification.userId === spotlightUser.id);
    while (existingForUser().length < 50) {
      const index = existingForUser().length + 1;
      store.notifications.push({
        id: `note_demo_${spotlightUser.id}_${String(index).padStart(3, "0")}`,
        userId: spotlightUser.id,
        title: `${spotlightUser.name} update ${index}`,
        message: `Sample notification ${index} for ${spotlightUser.name} showing workflow activity in the system.`,
        type: index % 4 === 0 ? "CONFLICT" : index % 3 === 0 ? "APPOINTMENT" : "info",
        readAt: index % 2 === 0 ? new Date().toISOString() : null
      });
    }
  }

  const primaryClient = store.users.find((user) => user.id === "user_client_1");
  if (primaryClient && lawyers.length > 0) {
    const existingClientAppointments = () => store.appointments.filter((appointment) => appointment.clientId === primaryClient.id);
    while (existingClientAppointments().length < 50) {
      const index = existingClientAppointments().length + 1;
      const lawyer = lawyers[(index - 1) % lawyers.length];
      const start = new Date(Date.UTC(2026, 4, 26 + ((index - 1) % 5), 8 + ((index - 1) % 6), 0, 0));
      const end = new Date(start);
      end.setUTCMinutes(end.getUTCMinutes() + 30);
      store.appointments.push({
        id: `appt_client_${String(index).padStart(3, "0")}`,
        clientId: primaryClient.id,
        lawyerId: lawyer.id,
        consultationType: index % 2 === 0 ? "General consultation" : "Court deadline preparation",
        subject: `Client inquiry ${index}`,
        description: `Primary client demo inquiry ${index} for showing transactions and follow-up actions.`,
        priority: index % 3 === 0 ? "URGENT" : index % 2 === 0 ? "MODERATE" : "REGULAR",
        status: statusCycle[(index - 1) % statusCycle.length],
        preferredStart: start.toISOString(),
        preferredEnd: end.toISOString(),
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
        locationMode: index % 2 === 0 ? "IN_PERSON" : "PHONE",
        conflictStatus: index % 5 === 0 ? "CONFLICT" : "CLEAR"
      });
    }
  }
}

ensureUsersForRole("admin", 50);
ensureUsersForRole("staff", 50);
ensureUsersForRole("lawyer", 50);
ensureUsersForRole("client", 50);
ensureAvailabilityForLawyers();
ensureAppointmentsAndNotifications();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => res.json({ ok: true, now: new Date().toISOString() }));

app.get("/api/lawyers", (req, res) => {
  const docs = store.lawyers.map((l) => ({ ...l, user: store.users.find(u => u.id === l.userId) }));
  res.json({ data: { lawyers: docs } });
});

app.get("/api/appointments", (req, res) => {
  const currentUser = store.users.find((user) => user.id === req.cookies?.demo_user);
  const isPrivileged = currentUser && ["admin", "staff", "lawyer"].includes(store.roles.find((role) => role.id === currentUser.roleId)?.slug);
  const appointments = currentUser && !isPrivileged
    ? store.appointments.filter((appointment) => appointment.clientId === currentUser.id)
    : store.appointments;

  res.json({ data: { appointments } });
});

app.post("/api/appointments", (req, res) => {
  const payload = req.body;
  const id = `appt_${Date.now()}`;
  const currentUser = store.users.find((user) => user.id === req.cookies?.demo_user);
  const currentRole = currentUser && store.roles.find((role) => role.id === currentUser.roleId)?.slug;
  const client = currentRole === "client" ? currentUser : store.users.find((user) => user.roleId === roleBySlug("client")?.id);
  const appt = {
    id,
    clientId: client?.id,
    ...payload,
    lawyerId: payload.lawyerId || null,
    priority: payload.priority || "REGULAR",
    preferredStart: payload.preferredStart || new Date().toISOString(),
    preferredEnd: payload.preferredEnd || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    status: "PENDING",
    conflictStatus: "CLEAR",
    createdAt: new Date().toISOString()
  };
  store.appointments.push(appt);
  store.notifications.push({
    id: `note_appt_${id}`,
    userId: appt.clientId,
    title: "Appointment inquiry received",
    message: `Your inquiry ${id} has been submitted and queued for review.`,
    type: "APPOINTMENT",
    readAt: null
  });
  res.status(201).json({ data: { appointment: appt } });
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
  const currentUser = store.users.find((user) => user.id === req.cookies?.demo_user);
  const notifications = currentUser
    ? store.notifications.filter((notification) => notification.userId === currentUser.id)
    : store.notifications;
  res.json({ data: { notifications } });
});

app.patch("/api/notifications/read-all", (req, res) => {
  const currentUser = store.users.find((user) => user.id === req.cookies?.demo_user);
  if (!currentUser) return res.status(401).json({ message: "Not authenticated" });
  let updated = 0;
  store.notifications.forEach((notification) => {
    if (notification.userId === currentUser.id && !notification.readAt) {
      notification.readAt = new Date().toISOString();
      updated += 1;
    }
  });
  res.json({ data: { updated } });
});

app.patch("/api/notifications/:id/read", (req, res) => {
  const currentUser = store.users.find((user) => user.id === req.cookies?.demo_user);
  if (!currentUser) return res.status(401).json({ message: "Not authenticated" });
  const notification = store.notifications.find((item) => item.id === req.params.id && item.userId === currentUser.id);
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  notification.readAt = new Date().toISOString();
  res.json({ data: { notification } });
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

  app.post(`${prefix}/auth/register`, (req, res) => {
    const { name, email, password } = req.body || {};
    if (!email || !password || !name) {
      return res.status(422).json({ message: 'Missing required fields' });
    }
    const existing = findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const id = `user_${Date.now()}`;
    const role = store.roles.find(r => r.slug === 'client') || { id: 'role_client', slug: 'client', name: 'Client' };
    const user = { id, roleId: role.id, name, email };
    store.users.push(user);
    res.status(201).json(setAuthCookies(res, user));
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
async function probeHealth(port) {
  try {
    const url = `http://127.0.0.1:${port}/health`;
    const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      const body = await res.json().catch(() => null);
      if (body && body.ok) return true;
    }
  } catch (e) {
    // ignore
  }
  return false;
}

async function listenWithRetry(app, port, attempts = 8) {
  for (let i = 0; i <= attempts; i++) {
    try {
      const server = await new Promise((resolve, reject) => {
        const s = app.listen(port, () => resolve(s));
        s.on('error', reject);
      });
      console.log(`Demo server listening on port ${port}`);
      return server;
    } catch (err) {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} in use.`);
        // If something is already listening and responds to /health, assume it's the demo server and exit successfully
        const healthy = await probeHealth(port);
        if (healthy) {
          console.log(`Detected existing demo server on port ${port}; exiting (no new server started).`);
          process.exit(0);
        }
        // otherwise try next port
        port += 1;
        await new Promise(r => setTimeout(r, 300));
        continue;
      }
      throw err;
    }
  }
  throw new Error('listenWithRetry: exhausted port attempts');
}

listenWithRetry(app, basePort).catch(err => {
  console.error('Failed to start demo server:', err);
  process.exit(1);
});
