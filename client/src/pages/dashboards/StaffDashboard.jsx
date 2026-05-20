import { useEffect, useState } from "react";
import { Users, CalendarCheck, ClipboardList } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/StatCard";
import api, { unwrap } from "../../lib/api";
import { mapAppointment } from "../../features/appointments/mappers";

export default function StaffDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([api.get("/appointments?limit=10"), api.get("/users?role=client")])
      .then(([apptsResp, clientsResp]) => {
        if (!active) return;
        setAppointments((unwrap(apptsResp).appointments || []).map(mapAppointment).filter(Boolean));
        setClients(unwrap(clientsResp).users || []);
      })
      .catch(() => { if (!active) { setAppointments([]); setClients([]); } })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} label="Active clients" value={loading ? "..." : `${clients.length}`} />
          <StatCard icon={CalendarCheck} label="Pending appointments" value={loading ? "..." : `${appointments.filter(a => a.status === 'PENDING').length}`} />
          <StatCard icon={ClipboardList} label="Tasks" value="8" />
        </div>

        <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
          <h3 className="font-extrabold">Upcoming appointments</h3>
          <div className="mt-4 grid gap-3">
            {loading ? <p>Loading...</p> : appointments.map(a => (
              <div key={a.id} className="rounded p-3 border">{a.title} — {a.status}</div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
