// Simple in-browser mock data store backed by localStorage for demo mode
const LS_PREFIX = "lfc_mock_";
import { publishRefresh } from "./refreshBus";

function read(key) {
  const raw = localStorage.getItem(LS_PREFIX + key);
  return raw ? JSON.parse(raw) : null;
}

function write(key, value) {
  localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
}

function ensureDefaults() {
  if (!read("roles")) {
    write("roles", [
      { id: "role_admin", slug: "admin", name: "Admin" },
      { id: "role_staff", slug: "staff", name: "Staff" },
      { id: "role_lawyer", slug: "lawyer", name: "Lawyer" },
      { id: "role_client", slug: "client", name: "Client" }
    ]);
  }

  if (!read("users")) {
    const now = new Date().toISOString();
    write("users", [
      { id: "user_admin", roleId: "role_admin", name: "Ariana Cruz", email: "admin@demo.local", password: "Password123!", createdAt: now },
      { id: "user_staff", roleId: "role_staff", name: "Jessa Valdez", email: "staff@demo.local", password: "Password123!", createdAt: now },
      { id: "user_lawyer_1", roleId: "role_lawyer", name: "Elena Rivera", email: "elena.rivera@demo.local", password: "Password123!", createdAt: now },
      { id: "user_lawyer_2", roleId: "role_lawyer", name: "Victor Santos", email: "victor.santos@demo.local", password: "Password123!", createdAt: now },
      { id: "user_lawyer_3", roleId: "role_lawyer", name: "Bianca Cruz", email: "bianca.cruz@demo.local", password: "Password123!", createdAt: now },
      { id: "user_client_1", roleId: "role_client", name: "Lila Santos", email: "client@demo.local", password: "Password123!", createdAt: now }
    ]);
  } else {
    const users = read("users") || [];
    const normalized = users.map((user) => ({
      ...user,
      password: user.password === "password" || !user.password ? "Password123!" : user.password
    }));
    write("users", normalized);
  }

  if (!read("lawyers")) {
    write("lawyers", [
      { id: "lawyer_1", userId: "user_lawyer_1", barNumber: "BAR-1001", specialization: "Family Law", workload: 24 },
      { id: "lawyer_2", userId: "user_lawyer_2", barNumber: "BAR-1002", specialization: "Corporate Law", workload: 18 },
      { id: "lawyer_3", userId: "user_lawyer_3", barNumber: "BAR-1003", specialization: "Estate Law", workload: 30 }
    ]);
  }

  if (!read("appointments")) {
    const appts = [
      {
        id: "appt_demo_001",
        clientId: "user_client_1",
        lawyerId: "lawyer_1",
        consultationType: "Initial intake meeting",
        subject: "Consultation: Estate planning",
        description: "Discuss estate planning options.",
        priority: "REGULAR",
        status: "PENDING",
        preferredStart: new Date(Date.now() + 86400000).toISOString(),
        preferredEnd: new Date(Date.now() + 86400000 + 30 * 60 * 1000).toISOString(),
        scheduledStart: null,
        scheduledEnd: null,
        locationMode: "PHONE",
        conflictStatus: "CLEAR",
        createdAt: new Date().toISOString()
      }
    ];
    write("appointments", appts);
  }

  if (!read("notifications")) {
    write("notifications", []);
  }
}

function generateReminders() {
  const appts = read('appointments') || [];
  const now = Date.now();
  const dayAhead = now + 24 * 60 * 60 * 1000;
  const notes = read('notifications') || [];
  appts.forEach((a) => {
    if (!a.scheduledStart) return;
    const s = new Date(a.scheduledStart).getTime();
    if (s > now && s <= dayAhead) {
      // avoid duplicate reminders for same appointment id
      const exists = notes.find(n => n.meta && n.meta.apptId === a.id && n.type === 'REMINDER');
      if (!exists) {
        const note = { id: uid('note'), userId: a.clientId, title: 'Upcoming appointment', message: `Reminder: appointment ${a.id} starts soon.`, createdAt: new Date().toISOString(), type: 'REMINDER', meta: { apptId: a.id } };
        notes.unshift(note);
      }
    }
  });
  write('notifications', notes);
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// Basic conflict detection: checks overlapping times for same lawyer
// Basic conflict detection: checks overlapping times for same lawyer
// This checks against both scheduled appointments and other preferred windows to be conservative.
function detectConflictForLawyer(lawyerId, startIso, endIso) {
  const appointments = read("appointments") || [];
  if (!startIso || !endIso) return false;
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();

  return appointments.some((a) => {
    if (a.lawyerId !== lawyerId) return false;
    // prefer scheduled times when present
    const sIso = a.scheduledStart || a.preferredStart;
    const eIso = a.scheduledEnd || a.preferredEnd;
    if (!sIso || !eIso) return false;
    const s = new Date(sIso).getTime();
    const e = new Date(eIso).getTime();
    return Math.max(s, start) < Math.min(e, end);
  });
}

const MockStore = {
  init() {
    ensureDefaults();
    // generate initial reminders for scheduled appointments
    try { generateReminders(); } catch { /* best-effort */ }
  },
  getRoles() { return read("roles") || []; },
  getUsers() { return read("users") || []; },
  getCurrentUser() {
    const session = JSON.parse(localStorage.getItem("lfc_user") || "null");
    if (!session?.user?.id) return null;
    return (read("users") || []).find((user) => user.id === session.user.id) || null;
  },
  findUserByEmail(email) { return (read("users") || []).find(u => u.email === email); },
  createUser({ name, email, password, role = "role_client" }) {
    const users = read("users") || [];
    const id = `user_${email.split("@")[0]}`;
    // allow passing either a role id or a role slug
    const roles = read("roles") || [];
    const roleObj = roles.find(r => r.id === role || r.slug === role) || roles.find(r => r.slug === "client");
    const user = { id, roleId: roleObj?.id || "role_client", name, email, password, createdAt: new Date().toISOString() };
    users.push(user);
    write("users", users);
    try { publishRefresh("users:updated"); } catch (err) { void err; }
    return user;
  },
  updateUser(id, patch) {
    const users = read("users") || [];
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...patch };
    write("users", users);
    try { publishRefresh("users:updated"); } catch (err) { void err; }
    return users[index];
  },
  getLawyers() { return read("lawyers") || []; },
  getAppointments() { return read("appointments") || []; },
  createAppointment(payload) {
    const appointments = read("appointments") || [];
    const appt = { id: uid("appt"), ...payload, createdAt: new Date().toISOString(), status: payload.status || "PENDING" };
    // Conflict detection: check scheduled window first, otherwise check preferred window
    if (appt.scheduledStart && appt.scheduledEnd) {
      appt.conflictStatus = detectConflictForLawyer(appt.lawyerId, appt.scheduledStart, appt.scheduledEnd) ? "CONFLICT" : "CLEAR";
    } else if (appt.preferredStart && appt.preferredEnd) {
      appt.conflictStatus = detectConflictForLawyer(appt.lawyerId, appt.preferredStart, appt.preferredEnd) ? "CONFLICT" : "CLEAR";
    } else {
      appt.conflictStatus = "CLEAR";
    }
    appointments.push(appt);
    write("appointments", appointments);
    try { publishRefresh("appointments:updated"); } catch (err) { void err; }
    return appt;
  },
  updateAppointment(id, patch) {
    const appointments = read("appointments") || [];
    const idx = appointments.findIndex(a => a.id === id);
    if (idx === -1) return null;
    // preserve history: if a historyItem is provided in patch, append it
    const existing = appointments[idx];
    const newAppt = { ...existing, ...patch };
    if (patch.historyItem) {
      newAppt.history = newAppt.history || [];
      newAppt.history.push({ ...(patch.historyItem), createdAt: new Date().toISOString() });
    }
    appointments[idx] = newAppt;
    // Re-evaluate conflicts if scheduled or preferred times changed
    const a = appointments[idx];
    if (a.scheduledStart && a.scheduledEnd) {
      a.conflictStatus = detectConflictForLawyer(a.lawyerId, a.scheduledStart, a.scheduledEnd) ? "CONFLICT" : "CLEAR";
    } else if (a.preferredStart && a.preferredEnd) {
      a.conflictStatus = detectConflictForLawyer(a.lawyerId, a.preferredStart, a.preferredEnd) ? "CONFLICT" : "CLEAR";
    }
    write("appointments", appointments);
    try { publishRefresh("appointments:updated"); } catch (err) { void err; }
    return appointments[idx];
  },
  deleteAppointment(id) {
    let appointments = read("appointments") || [];
    appointments = appointments.filter(a => a.id !== id);
    write("appointments", appointments);
    try { publishRefresh("appointments:updated"); } catch (err) { void err; }
    return true;
  },
  getNotifications() { return read("notifications") || []; },
  createNotification(n) {
    const notes = read("notifications") || [];
    const note = { id: uid("note"), ...n, createdAt: new Date().toISOString(), readAt: n.readAt || null };
    notes.unshift(note);
    write("notifications", notes);
    try { publishRefresh("notifications:updated"); } catch (err) { void err; }
    return note;
  },
  markNotificationRead(id) {
    const notes = read("notifications") || [];
    const note = notes.find(n => n.id === id);
    if (note) note.readAt = new Date().toISOString();
    write("notifications", notes);
    try { publishRefresh("notifications:updated"); } catch (err) { void err; }
    return note;
  },
  markAllNotificationsRead(userId) {
    const notes = read("notifications") || [];
    for (const n of notes.filter(x => x.userId === userId)) n.readAt = new Date().toISOString();
    write("notifications", notes);
    try { publishRefresh("notifications:updated"); } catch (err) { void err; }
    return true;
  },
  detectConflictForLawyer
};

export default MockStore;
