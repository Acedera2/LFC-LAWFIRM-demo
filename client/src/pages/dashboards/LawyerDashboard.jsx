import { useEffect, useState } from "react";
import { Calendar, CheckSquare, MessageSquare } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/StatCard";
import api, { unwrap } from "../../lib/api";
import { mapAppointment, sortAppointmentsByPriority } from "../../features/appointments/mappers";
import { subscribeRefresh } from "../../lib/refreshBus";

export default function LawyerDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [apptsResp, msgsResp] = await Promise.all([api.get("/appointments?role=lawyer&limit=10"), api.get("/messages?unread=true")]);
        if (!active) return;
        setAppointments(sortAppointmentsByPriority((unwrap(apptsResp).appointments || []).map(mapAppointment).filter(Boolean)));
        setMessages(unwrap(msgsResp).messages || []);
      } catch {
        if (!active) { setAppointments([]); setMessages([]); }
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
          <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">Lawyer dashboard</p>
          <h2 className="mt-2 text-2xl font-extrabold text-ink-900 dark:text-white">Assigned consultations and daily schedule</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-500 dark:text-ink-100">Use this page to see today’s consultations, review pending matters, and track unread assignment messages without digging through other pages.</p>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Calendar} label="Today" value={loading ? "..." : `${appointments.filter(a => a.isToday).length}`} />
          <StatCard icon={CheckSquare} label="To review" value={loading ? "..." : `${appointments.filter(a => a.status === 'PENDING').length}`} />
          <StatCard icon={MessageSquare} label="Unread messages" value={loading ? "..." : `${messages.length}`} />
        </div>

        <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-extrabold text-ink-900 dark:text-white">My schedule</h3>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-100">A simple list of your assigned consultations and their start times.</p>
          </div>
          <div className="mt-4 grid gap-3">
            {loading ? <p className="text-sm text-ink-500 dark:text-ink-100">Loading assigned consultations and schedule details...</p> : appointments.length ? appointments.map(a => (
              <div key={a.id} className="rounded-2xl border border-ink-100 bg-ink-50 p-3 dark:border-white/10 dark:bg-white/5">{a.title} — {a.scheduledStart ? new Date(a.scheduledStart).toLocaleString() : 'Not scheduled'}</div>
            )) : <p className="text-sm text-ink-500 dark:text-ink-100">No assigned consultations yet. New assignments will appear here.</p>}
          </div>
        </section>
      </div>
    </DashboardLayout> 
  );
}
  