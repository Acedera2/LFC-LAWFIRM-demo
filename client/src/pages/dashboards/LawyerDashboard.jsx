import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BriefcaseBusiness, CalendarDays, Gauge } from "lucide-react";
import AppointmentCard from "../../components/AppointmentCard";
import CalendarGrid from "../../components/CalendarGrid";
import ChartCard from "../../components/ChartCard";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import StatCard from "../../components/StatCard";
import api, { unwrap } from "../../lib/api";
import { mapAppointment } from "../../features/appointments/mappers";

export default function LawyerDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/appointments?limit=8"), api.get("/schedules/availability")])
      .then(([appointmentsResponse, availabilityResponse]) => {
        if (!active) return;
        setAppointments((unwrap(appointmentsResponse).appointments || []).map(mapAppointment));
        setAvailability(unwrap(availabilityResponse).availability || []);
      })
      .catch(() => {
        if (!active) return;
        setAppointments([]);
        setAvailability([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const conflictAlerts = appointments.filter((item) => ["CONFLICT", "WARNING"].includes(item.conflictStatus)).length;
  const activeMatters = new Set(appointments.map((item) => item.clientId)).size;
  const timeline = useMemo(
    () => appointments
      .flatMap((item) => (item.history || []).map((entry) => ({ label: entry.action.replaceAll("_", " "), time: new Date(entry.createdAt).toLocaleString() })))
      .slice(0, 8),
    [appointments]
  );

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarDays} label="Today schedule" value={loading ? "..." : `${appointments.length}`} trend="Current assignment queue" />
        <StatCard icon={Gauge} label="Workload" value={loading ? "..." : `${Math.min(100, appointments.length * 12)}%`} trend="Based on current assignments" tone="brass" />
        <StatCard icon={AlertTriangle} label="Conflict alerts" value={loading ? "..." : `${conflictAlerts}`} trend="Detected overlap or capacity warnings" tone="coral" />
        <StatCard icon={BriefcaseBusiness} label="Active matters" value={loading ? "..." : `${activeMatters}`} trend="Distinct clients in pipeline" tone="blue" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartCard title="Availability calendar" subtitle="Set availability and review scheduled consultation windows.">
          <CalendarGrid />
          {!loading && (
            <p className="mt-3 text-xs font-semibold text-ink-500 dark:text-ink-100">
              {availability.length} availability entries loaded.
            </p>
          )}
        </ChartCard>
        <ChartCard title="Consultation priorities" subtitle="Daily queue sorted by urgency and schedule risk.">
          {loading ? <LoadingSkeleton rows={3} /> : <div className="grid gap-4">{appointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)}</div>}
        </ChartCard>
      </div>
      <ChartCard title="Appointment timeline" subtitle="Each client request keeps an operational activity trail.">
        <div className="grid gap-3 md:grid-cols-4">
          {timeline.map((item) => (
            <div key={item.label} className="rounded-lg border border-ink-100 p-4 dark:border-white/10">
              <p className="text-xs font-extrabold uppercase text-ink-500 dark:text-ink-100">{item.time}</p>
              <p className="mt-2 text-sm font-bold text-ink-900 dark:text-white">{item.label}</p>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
