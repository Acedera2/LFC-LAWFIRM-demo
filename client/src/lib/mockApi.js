import MockStore from "./mockStore";

function delay(ms = 200) {
  return new Promise((r) => setTimeout(r, ms));
}

MockStore.init();

function currentUser() {
  const raw = localStorage.getItem("lfc_user");
  return raw ? JSON.parse(raw) : null;
}

function respond(data) {
  return { data: { data } };
}

const MockApi = {
  async request({ method = "get", url = "", data, params } = {}) {
    await delay(120);
    const m = method.toLowerCase();
    // attach params to url if provided
    if (params && typeof params === 'object') {
      const q = new URLSearchParams(params).toString();
      if (q) url = `${url}${url.includes('?') ? '&' : '?'}${q}`;
    }
    // Auth endpoints
    if (url.startsWith("/auth")) {
      const path = url.replace(/^\/auth/, "");
      if (m === "post" && path === "/login") {
        const { email, password } = data || {};
        const user = MockStore.findUserByEmail(email);
        if (user && user.password === password) {
          const payload = { id: user.id, name: user.name, role: { slug: (MockStore.getRoles().find(r => r.id === user.roleId) || {}).slug || "client" } };
          localStorage.setItem("lfc_user", JSON.stringify({ user: payload }));
          return respond({ user: payload });
        }
        const err = new Error("Invalid credentials");
        err.response = { status: 401 };
        throw err;
      }

      if (m === "post" && path === "/register") {
        const { name, email, password } = data || {};
        const user = MockStore.createUser({ name, email, password, role: "role_client" });
        const payload = { id: user.id, name: user.name, role: { slug: "client" } };
        localStorage.setItem("lfc_user", JSON.stringify({ user: payload }));
        return respond({ user: payload });
      }

      if (m === "post" && path === "/logout") {
        localStorage.removeItem("lfc_user");
        return respond({ ok: true });
      }

      if (m === "get" && path === "/me") {
        const u = currentUser();
        if (!u) {
          const err = new Error("Not authenticated");
          err.response = { status: 401 };
          throw err;
        }
        return respond({ user: u.user });
      }
    }

    // Appointments
    if (url.startsWith("/appointments")) {
      // PATCH /appointments/:id
      if (m === "patch") {
        const parts = url.split("/");
        const id = parts[2];
        const patch = data || {};
        const updated = MockStore.updateAppointment(id, patch);
        if (updated) {
          // notify client
          MockStore.createNotification({ userId: updated.clientId, title: "Appointment updated", message: `Your appointment ${updated.id} was updated.` });
          // notify assigned lawyer if present
          if (updated.lawyerId) {
            const lawyer = MockStore.getLawyers().find(l => l.id === updated.lawyerId);
            if (lawyer) MockStore.createNotification({ userId: lawyer.userId, title: "Appointment assigned", message: `You were assigned to ${updated.id}.` });
          }
          // staff/admin notification
          const staff = MockStore.getUsers().filter(u => MockStore.getRoles().find(r => r.id === u.roleId)?.slug === "staff" || MockStore.getRoles().find(r => r.id === u.roleId)?.slug === "admin");
          staff.forEach(s => MockStore.createNotification({ userId: s.id, title: "Appointment updated", message: `${updated.id} status changed to ${updated.status || 'UPDATED'}.` }));
        }
        return respond({ appointment: updated });
      }
      // conflict-check helper
      if (m === "post" && url.endsWith("/conflict-check")) {
        const { lawyerId, preferredStart, preferredEnd } = data || {};
        const conflict = MockStore.detectConflictForLawyer(lawyerId, preferredStart, preferredEnd);
        return respond({ conflict, available: !conflict });
      }
      if (m === "get") {
        // Support single-appointment GET: /appointments/:id
        const pathOnly = url.split("?")[0];
        const idMatch = pathOnly.match(/^\/appointments\/(.+)$/);
        if (idMatch) {
          const id = idMatch[1];
          const appt = MockStore.getAppointments().find(a => a.id === id);
          if (!appt) {
            const err = new Error("Not found");
            err.response = { status: 404 };
            throw err;
          }
          // hydrate client and lawyer objects for UI convenience
          try {
            const client = MockStore.getUsers().find(u => u.id === appt.clientId) || null;
            const lawyer = MockStore.getLawyers().find(l => l.id === appt.lawyerId) || null;
            const hydrated = { ...appt, client: client ? { id: client.id, name: client.name, email: client.email } : null, lawyer: lawyer ? { ...lawyer, user: MockStore.getUsers().find(u => u.id === lawyer.userId) || null } : null };
            return respond({ appointment: hydrated });
          } catch {
            return respond({ appointment: appt });
          }
        }

        const parts = url.split("?");
        const q = new URLSearchParams(parts[1] || "");
        const user = currentUser();
        const all = MockStore.getAppointments();
        const search = (q.get("search") || "").toLowerCase();
        const clientId = q.get("clientId");
        const limit = Number(q.get("limit") || all.length || 10);
        const page = Math.max(1, Number(q.get("page") || 1));

        const filteredAll = all.filter((appointment) => {
          const matchesClient = !clientId || appointment.clientId === clientId;
          const haystack = `${appointment.subject || ""} ${appointment.consultationType || ""} ${appointment.status || ""}`.toLowerCase();
          const matchesSearch = !search || haystack.includes(search);
          return matchesClient && matchesSearch;
        });

        if (!user) return respond({ appointments: all });
        const role = user.user.role?.slug || "client";
        if (role === "client") {
          const filtered = filteredAll.filter((appointment) => appointment.clientId === user.user.id);
          const totalItems = filtered.length;
          const totalPages = Math.max(1, Math.ceil(totalItems / limit));
          const start = (page - 1) * limit;
          return respond({ appointments: filtered.slice(start, start + limit), meta: { page, limit, totalItems, totalPages } });
        }
        if (role === "lawyer") {
          const lawyers = MockStore.getLawyers();
          const lawyer = lawyers.find(l => l.userId === user.user.id);
          const filtered = filteredAll.filter((appointment) => appointment.lawyerId === (lawyer && lawyer.id));
          const totalItems = filtered.length;
          const totalPages = Math.max(1, Math.ceil(totalItems / limit));
          const start = (page - 1) * limit;
          return respond({ appointments: filtered.slice(start, start + limit), meta: { page, limit, totalItems, totalPages } });
        }
        // staff/admin — hydrate appointment objects with client/lawyer for UI
        const totalItems = filteredAll.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / limit));
        const start = (page - 1) * limit;
        const pageItems = filteredAll.slice(start, start + limit).map((a) => {
          try {
            const client = MockStore.getUsers().find(u => u.id === a.clientId) || null;
            const lawyer = MockStore.getLawyers().find(l => l.id === a.lawyerId) || null;
            return { ...a, client: client ? { id: client.id, name: client.name, email: client.email } : null, lawyer: lawyer ? { ...lawyer, user: MockStore.getUsers().find(u => u.id === lawyer.userId) || null } : null };
          } catch {
            return a;
          }
        });
        return respond({ appointments: pageItems, meta: { page, limit, totalItems, totalPages } });
      }

      if (m === "post") {
        const appt = MockStore.createAppointment(data);
        // create simple notifications for client and staff
        MockStore.createNotification({ userId: appt.clientId, title: "Inquiry submitted", message: "Your appointment request was received." });
        const staff = MockStore.getUsers().filter(u => MockStore.getRoles().find(r => r.id === u.roleId)?.slug === "staff" || MockStore.getRoles().find(r => r.id === u.roleId)?.slug === "admin");
        staff.forEach(s => MockStore.createNotification({ userId: s.id, title: "New inquiry", message: `${appt.consultationType} requested.` }));

        // If a conflict was detected, create a conflict notification for the client and admins/staff
        if (appt.conflictStatus === "CONFLICT") {
          MockStore.createNotification({ userId: appt.clientId, title: "Conflict detected", message: "The requested time conflicts with an existing schedule. A staff member will follow up." });
          staff.forEach(s => MockStore.createNotification({ userId: s.id, title: "Conflict alert", message: `Conflict detected for ${appt.id} — please review.` }));
        }

        try {
          const client = MockStore.getUsers().find(u => u.id === appt.clientId) || null;
          const lawyer = MockStore.getLawyers().find(l => l.id === appt.lawyerId) || null;
          const hydrated = { ...appt, client: client ? { id: client.id, name: client.name, email: client.email } : null, lawyer: lawyer ? { ...lawyer, user: MockStore.getUsers().find(u => u.id === lawyer.userId) || null } : null };
          return respond({ appointment: hydrated });
        } catch {
          return respond({ appointment: appt });
        }
      }
      if (m === "delete") {
        // URL: /appointments/:id
        const parts = url.split("/");
        const id = parts[2];
        const ok = MockStore.deleteAppointment(id);
        return respond({ ok });
      }
    }

    // Notifications
    if (url.startsWith("/notifications")) {
      if (m === "get") {
        const user = currentUser();
        const all = MockStore.getNotifications();
        // hydrate notifications with simple user display info for convenience
        const hydrated = all.map((n) => {
          try {
            const u = MockStore.getUsers().find(x => x.id === n.userId) || null;
            return { ...n, user: u ? { id: u.id, name: u.name, email: u.email } : null };
          } catch {
            return n;
          }
        });
        if (!user) return respond({ notifications: hydrated });
        return respond({ notifications: hydrated.filter(n => n.userId === user.user.id) });
      }

      if (m === "patch") {
        // support /notifications/:id/read and /notifications/read-all
        if (url.endsWith("/read-all")) {
          const user = currentUser();
          MockStore.markAllNotificationsRead(user.user.id);
          return respond({ ok: true });
        }
        const parts = url.split("/");
        const id = parts[2];
        MockStore.markNotificationRead(id);
        return respond({ ok: true });
      }
    }

    // Messages (simple stub)
    if (url.startsWith("/messages")) {
      if (m === "get") {
        const msgs = [];
        return respond({ messages: msgs });
      }
    }

    // Lawyers
    if (url.startsWith("/lawyers")) {
      if (m === "get") {
        const lawyers = MockStore.getLawyers();
        const users = MockStore.getUsers();
        const appts = MockStore.getAppointments();
        const docs = lawyers.map(l => {
          const user = users.find(u => u.id === l.userId) || {};
          const apptCount = appts.filter(a => a.lawyerId === l.id && a.status !== 'CANCELLED').length;
          const status = apptCount > 20 ? 'FULLY_BOOKED' : apptCount > 10 ? 'BUSY' : 'AVAILABLE';
          const availability = status === 'FULLY_BOOKED' ? 'Fully booked' : status === 'BUSY' ? 'Busy' : 'Available';
          return { ...l, user, _count: { appointments: apptCount }, status, availability };
        });
        return respond({ lawyers: docs });
      }
    }

    // Clients listing (for staff)
    if (url.startsWith("/clients")) {
      if (m === "get") {
        const users = MockStore.getUsers().filter(u => MockStore.getRoles().find(r => r.id === u.roleId)?.slug === "client");
        return respond({ clients: users });
      }
    }

    // Users endpoint (supports /users?role=client)
    if (url.startsWith("/users")) {
      if (m === "get") {
        const parts = url.split("?");
        const q = new URLSearchParams(parts[1] || "");
        const role = q.get("role");
        const search = (q.get("search") || "").toLowerCase();
        const page = Math.max(1, Number(q.get("page") || 1));
        const limit = Number(q.get("limit") || 10);
        const filtered = MockStore.getUsers().filter(u => {
          if (!role) return true;
          return MockStore.getRoles().find(r => r.id === u.roleId)?.slug === role;
        }).filter((user) => {
          const haystack = `${user.name || ""} ${user.email || ""}`.toLowerCase();
          return !search || haystack.includes(search);
        });
        const totalItems = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / limit));
        const start = (page - 1) * limit;
        return respond({ users: filtered.slice(start, start + limit), meta: { page, limit, totalItems, totalPages } });
      }
    }

    // Settings endpoints (simple localStorage-backed)
    if (url.startsWith("/settings")) {
      const SETTINGS_KEY = "lfc_demo_settings";
      if (m === "get") {
        const raw = localStorage.getItem(SETTINGS_KEY);
        const settings = raw ? JSON.parse(raw) : [
          { key: "sessionTimeoutHours", value: 8 },
          { key: "maxBookingDays", value: 90 }
        ];
        return respond({ settings });
      }

      if (m === "put") {
        const { key, value } = data || {};
        const raw = localStorage.getItem(SETTINGS_KEY);
        const settings = raw ? JSON.parse(raw) : [];
        const existing = settings.find(s => s.key === key);
        const updated = { key, value };
        if (existing) {
          settings.splice(settings.indexOf(existing), 1, updated);
        } else {
          settings.push(updated);
        }
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return respond({ setting: updated });
      }
    }

    // Profile endpoint (current user editable profile)
    if (url.startsWith("/profile")) {
      if (m === "get") {
        const user = MockStore.getCurrentUser();
        if (!user) {
          const err = new Error("Not authenticated");
          err.response = { status: 401 };
          throw err;
        }
        return respond({ user });
      }

      if (m === "put" || m === "patch") {
        const session = currentUser();
        const user = session?.user;
        if (!user?.id) {
          const err = new Error("Not authenticated");
          err.response = { status: 401 };
          throw err;
        }

        const patch = data || {};
        const updated = MockStore.updateUser(user.id, {
          name: patch.name ?? user.name,
          email: patch.email ?? user.email,
          phone: patch.phone ?? user.phone,
          bio: patch.bio ?? user.bio,
          avatarUrl: patch.avatarUrl ?? user.avatarUrl,
          title: patch.title ?? user.title
        });

        const role = MockStore.getRoles().find((r) => r.id === updated.roleId);
        const payload = { ...updated, role: { slug: role?.slug || "client", name: role?.name || "Client" } };
        localStorage.setItem("lfc_user", JSON.stringify({ user: payload }));
        return respond({ user: payload });
      }
    }

    // Analytics lightweight
    if (url.startsWith("/analytics")) {
      if (m === "get") {
        // support /analytics/summary
        if (url.includes("/summary")) {
          const appts = MockStore.getAppointments();
          const dailyMap = appts.reduce((acc, appt) => {
            const date = (appt.scheduledStart || appt.preferredStart || appt.createdAt || "").slice(0, 10) || "Unknown";
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {});
          const daily = Object.entries(dailyMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)).slice(-12);
          const completionRate = Math.round((appts.filter((a) => ["COMPLETED", "CONFIRMED"].includes(a.status)).length / Math.max(1, appts.length)) * 100);
          const overview = {
            totalAppointments: appts.length,
            completionRate,
            conflictFrequency: Math.round((appts.filter(a => a.conflictStatus === "CONFLICT").length / Math.max(1, appts.length)) * 100)
          };
          const services = Object.entries(appts.reduce((acc, appt) => {
            const key = appt.consultationType || appt.subject || "Consultation";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {})).map(([service, count]) => ({ service, count })).sort((a, b) => b.count - a.count);
          const peakConsultationHours = Object.entries(appts.reduce((acc, appt) => {
            const start = new Date(appt.scheduledStart || appt.preferredStart || appt.createdAt || Date.now());
            const hour = `${String(start.getHours()).padStart(2, "0")}:00`;
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
          }, {})).map(([hour, count]) => ({ hour, count })).sort((a, b) => a.hour.localeCompare(b.hour));
          const lawyers = MockStore.getLawyers().map((l) => ({ lawyerName: MockStore.getUsers().find(u => u.id === l.userId)?.name || "", appointments: appts.filter(a => a.lawyerId === l.id).length }));
          const statusCounts = appts.reduce((acc, appt) => {
            const key = appt.status || "PENDING";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {});
          const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count);
          return respond({ dailyAppointments: daily, peakConsultationHours, overview, mostRequestedServices: services, appointmentsPerLawyer: lawyers, statusBreakdown });
        }
        const appts = MockStore.getAppointments();
        const total = appts.length;
        const byPriority = appts.reduce((acc, a) => { acc[a.priority] = (acc[a.priority]||0)+1; return acc; }, {});
        return respond({ totals: { total, byPriority } });
      }
    }

    // Admin metrics
    if (url.startsWith("/admin/metrics")) {
      if (m === "get") {
        const appts = MockStore.getAppointments();
        const users = MockStore.getUsers();
        return respond({ metrics: { totalAppointments: appts.length, totalUsers: users.length, conflictCount: appts.filter(a => a.conflictStatus === "CONFLICT").length } });
      }
    }

    // Unhandled: return empty success
    return respond({});
  },
  get(url, params) { return this.request({ method: "get", url, params }); },
  post(url, data) { return this.request({ method: "post", url, data }); },
  patch(url, data) { return this.request({ method: "patch", url, data }); },
  put(url, data) { return this.request({ method: "put", url, data }); },
  delete(url) { return this.request({ method: "delete", url }); }
};

export default MockApi;

// Expose to window for demo/debugging convenience
if (typeof window !== "undefined") {
  try {
    window.MockApi = MockApi;
    window.MockStore = MockStore;
  } catch {
    // ignore in non-browser contexts
  }
}
