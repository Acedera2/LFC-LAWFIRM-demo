import { useEffect, useState } from "react";
import { Users, CalendarCheck, ClipboardList } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/StatCard";
import api, { unwrap } from "../../lib/api";
import { mapAppointment, sortAppointmentsByPriority } from "../../features/appointments/mappers";
import { subscribeRefresh } from "../../lib/refreshBus";

export default function StaffDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [apptsResp, clientsResp, notificationsResp] = await Promise.all([
          api.get("/appointments?limit=10"),
          api.get("/users?role=client"),
          api.get("/notifications")
        ]);
        if (!active) return;
        setAppointments(sortAppointmentsByPriority((unwrap(apptsResp).appointments || []).map(mapAppointment).filter(Boolean)));
        setClients(unwrap(clientsResp).users || []);
        setNotifications((unwrap(notificationsResp).notifications || []).filter((notification) => notification.type === "APPOINTMENT"));
      } catch {
        if (!active) { setAppointments([]); setClients([]); setNotifications([]); }
      } finally {
        if (active) setLoading(false);
      }
    };

    const onUpdated = () => load();

    load();
    const unsubscribe = subscribeRefresh("appointments:updated", onUpdated);
    return () => { active = false; unsubscribe(); };
  }, []);

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">Staff dashboard</p>
          <h2 className="mt-2 text-2xl font-extrabold text-ink-900 dark:text-white">Queue coordination and conflict monitoring</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-500 dark:text-ink-100">Use this page to review pending requests, assign lawyers, and confirm that the day’s appointments are clear before approval.</p>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} label="Active clients" value={loading ? "..." : `${clients.length}`} />
          <StatCard icon={CalendarCheck} label="Pending appointments" value={loading ? "..." : `${appointments.filter(a => a.status === 'PENDING').length}`} />
          <StatCard icon={ClipboardList} label="New inquiries" value={loading ? "..." : `${notifications.filter((notification) => !notification.readAt).length}`} tone="blue" trend="Client inquiries waiting for staff review" />
          <StatCard icon={ClipboardList} label="Tasks" value="8" />
        </div>

        <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-extrabold text-ink-900 dark:text-white">Upcoming appointments</h3>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-100">The next scheduled matters that need staff attention or confirmation.</p>
          </div>
          <div className="mt-4 grid gap-3">
              {loading ? <p className="text-sm text-ink-500 dark:text-ink-100">Loading appointment queue and schedule status...</p> : appointments.length ? appointments.map(a => (
              <div key={a.id} className="rounded-2xl border border-ink-100 bg-ink-50 p-3 dark:border-white/10 dark:bg-white/5">{a.title} — {a.status}</div>
              )) : <p className="text-sm text-ink-500 dark:text-ink-100">No upcoming appointments yet. Incoming requests will appear here.</p>}
          </div>
        </section>

        <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-extrabold text-ink-900 dark:text-white">Latest inquiries</h3>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-100">Incoming requests that should be reviewed, assigned, or escalated.</p>
          </div>
          <div className="mt-4 grid gap-3">
              {loading ? <p className="text-sm text-ink-500 dark:text-ink-100">Loading new inquiries and notifications...</p> : notifications.length ? notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="rounded-2xl border border-ink-100 p-3 dark:border-white/10 dark:bg-white/5">
                <p className="font-bold">{notification.title}</p>
                <p className="text-sm text-ink-500">{notification.message}</p>
              </div>
              )) : <p className="text-sm text-ink-500 dark:text-ink-100">No new inquiries yet. Client submissions will show here first.</p>}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
