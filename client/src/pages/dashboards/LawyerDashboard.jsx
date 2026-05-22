import { useEffect, useState } from "react";
import { Calendar, CheckSquare, MessageSquare } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/StatCard";
import api, { unwrap } from "../../lib/api";
import { mapAppointment } from "../../features/appointments/mappers";

export default function LawyerDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([api.get("/api/appointments?role=lawyer&limit=10"), api.get("/api/messages?unread=true")])
      .then(([apptsResp, msgsResp]) => {
        if (!active) return;
        setAppointments((unwrap(apptsResp).appointments || []).map(mapAppointment).filter(Boolean));
        setMessages(unwrap(msgsResp).messages || []);
      })
      .catch(() => { if (!active) { setAppointments([]); setMessages([]); } })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Calendar} label="Today" value={loading ? "..." : `${appointments.filter(a => a.isToday).length}`} />
          <StatCard icon={CheckSquare} label="To review" value={loading ? "..." : `${appointments.filter(a => a.status === 'PENDING').length}`} />
          <StatCard icon={MessageSquare} label="Unread messages" value={loading ? "..." : `${messages.length}`} />
        </div>

        <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
          <h3 className="font-extrabold">My schedule</h3>
          <div className="mt-4 grid gap-3">
            {loading ? <p>Loading...</p> : appointments.map(a => (
              <div key={a.id} className="rounded p-3 border">{a.title} — {a.scheduledStart ? new Date(a.scheduledStart).toLocaleString() : 'Not scheduled'}</div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
