import { useEffect, useState } from "react";
import { AlertTriangle, CalendarCheck, ClipboardCheck, FileBarChart, UserRoundCheck } from "lucide-react";
import AppointmentCard from "../../components/AppointmentCard";
import ChartCard from "../../components/ChartCard";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import StatCard from "../../components/StatCard";
import api, { unwrap } from "../../lib/api";
import { mapAppointment } from "../../features/appointments/mappers";

export default function StaffDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/appointments?limit=10"), api.get("/lawyers")])
      .then(([appointmentsResponse, lawyersResponse]) => {
        if (!active) return;
        setAppointments((unwrap(appointmentsResponse).appointments || []).map(mapAppointment));
        setLawyers(unwrap(lawyersResponse).lawyers || []);
      })
      .catch(() => {
        if (!active) return;
        setAppointments([]);
        setLawyers([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const pending = appointments.filter((item) => ["PENDING", "RESCHEDULE_REQUESTED"].includes(item.status)).length;
  const conflictAlerts = appointments.filter((item) => ["CONFLICT", "WARNING"].includes(item.conflictStatus)).length;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ClipboardCheck} label="Pending requests" value={loading ? "..." : `${pending}`} trend="Awaiting assignment or approval" />
        <StatCard icon={UserRoundCheck} label="Assigned lawyers" value={loading ? "..." : `${lawyers.length}`} trend="Active profiles available" tone="blue" />
        <StatCard icon={AlertTriangle} label="Conflict alerts" value={loading ? "..." : `${conflictAlerts}`} trend="Need review or reschedule" tone="coral" />
        <StatCard icon={FileBarChart} label="Reports ready" value={loading ? "..." : "Live"} trend="Analytics module available" tone="brass" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Appointment queue" subtitle="Verify schedules, assign lawyers, and monitor conflict alerts.">
          {loading ? <LoadingSkeleton rows={3} /> : <div className="grid gap-4">{appointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)}</div>}
        </ChartCard>
        <ChartCard title="Lawyer assignment board" subtitle="Workload is updated from confirmed appointments.">
          <div className="grid gap-4">
            {lawyers.map((lawyer) => (
              <div key={lawyer.id} className="rounded-lg border border-ink-100 p-4 dark:border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-ink-900 dark:text-white">{lawyer.user?.name}</p>
                    <p className="text-sm text-ink-500 dark:text-ink-100">{lawyer.specialization}</p>
                  </div>
                  <CalendarCheck className="text-jade-700 dark:text-jade-100" size={20} />
                </div>
                <div className="mt-4 h-2 rounded-full bg-ink-100 dark:bg-white/10">
                  <div className="h-2 rounded-full bg-jade-400" style={{ width: `${Math.min(100, (lawyer._count?.appointments || 0) * 10)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
