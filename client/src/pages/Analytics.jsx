<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "../components/ChartCard";
import api, { unwrap } from "../lib/api";
import toast from "react-hot-toast";
=======
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "../components/ChartCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import api, { unwrap } from "../lib/api";
>>>>>>> fe1f118 (feat: integrate Supabase and enhance LFC scheduling system modules)

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
<<<<<<< HEAD
    const loadSummary = async () => {
      try {
        const response = await api.get("/analytics/summary");
        const data = unwrap(response);
        if (active) setSummary(data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load analytics summary");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadSummary();
=======
    api
      .get("/analytics/summary")
      .then((response) => {
        if (!active) return;
        setSummary(unwrap(response));
      })
      .catch(() => {
        if (!active) return;
        setSummary(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

>>>>>>> fe1f118 (feat: integrate Supabase and enhance LFC scheduling system modules)
    return () => {
      active = false;
    };
  }, []);

<<<<<<< HEAD
  const daily = summary?.dailyAppointments || [];
  const peakHours = summary?.peakConsultationHours || [];
  const overview = summary?.overview || {};
=======
  const analyticsSeries = useMemo(() => {
    if (!summary) return [];
    const daily = summary.dailyAppointments || [];
    const conflictsByDate = (summary.dailyLawyerWorkload || []).reduce((acc, item) => {
      acc[item.date] = (acc[item.date] || 0) + (item.conflicts || 0);
      return acc;
    }, {});

    return daily.map((item) => ({
      name: item.date.slice(5),
      appointments: item.count,
      conflicts: conflictsByDate[item.date] || 0
    }));
  }, [summary]);

  const completion = useMemo(() => {
    if (!summary) return [];
    const weekly = summary.weeklyWorkloadDistribution || [];
    const total = summary.overview?.totalAppointments || 0;
    const completed = summary.overview?.completedAppointments || 0;
    const baseline = total ? Number(((completed / total) * 100).toFixed(2)) : 0;
    return weekly.map((item, index) => ({
      month: `W${index + 1}`,
      rate: Math.min(100, Math.max(0, baseline))
    }));
  }, [summary]);

  const conflicts = summary?.overview
    ? [
        ["Double booking", `${summary.overview.conflictCount} detected`],
        ["Conflict frequency", `${summary.overview.conflictFrequency}%`],
        ["Pending reviews", `${summary.overview.pendingAppointments} queue`]
      ]
    : [];
>>>>>>> fe1f118 (feat: integrate Supabase and enhance LFC scheduling system modules)

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">Analytics</p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink-900 dark:text-white">Scheduling intelligence and firm performance</h1>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
<<<<<<< HEAD
        <ChartCard title="Daily and monthly appointments" subtitle="Live appointment volume from the last 30 days.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,89,104,0.16)" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#12805c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="Completion and conflict rate" subtitle="Actual delivery pace and schedule quality.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily.map((item) => ({ date: item.date, value: item.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,89,104,0.16)" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#b9862d" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
=======
        <ChartCard title="Daily and weekly appointments" subtitle="Appointment volume from intake through completion.">
          {loading ? (
            <LoadingSkeleton rows={4} />
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,89,104,0.16)" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="appointments" fill="#12805c" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="conflicts" fill="#e66f5c" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
        <ChartCard title="Completion rate" subtitle="Confirmed consultations completed against scheduled appointments.">
          {loading ? (
            <LoadingSkeleton rows={4} />
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={completion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,89,104,0.16)" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="rate" stroke="#b9862d" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
>>>>>>> fe1f118 (feat: integrate Supabase and enhance LFC scheduling system modules)
        </ChartCard>
      </div>
      <ChartCard title="Conflict frequency" subtitle="Tracked warnings and conflicts against the full queue.">
        <div className="grid gap-4 md:grid-cols-3">
<<<<<<< HEAD
          <div className="rounded-lg border border-ink-100 p-5 dark:border-white/10">
            <p className="text-sm font-semibold text-ink-500 dark:text-ink-100">Total appointments</p>
            <p className="mt-2 text-2xl font-extrabold text-ink-900 dark:text-white">{loading ? "—" : overview.totalAppointments}</p>
          </div>
          <div className="rounded-lg border border-ink-100 p-5 dark:border-white/10">
            <p className="text-sm font-semibold text-ink-500 dark:text-ink-100">Completion rate</p>
            <p className="mt-2 text-2xl font-extrabold text-ink-900 dark:text-white">{loading ? "—" : `${overview.completionRate}%`}</p>
          </div>
          <div className="rounded-lg border border-ink-100 p-5 dark:border-white/10">
            <p className="text-sm font-semibold text-ink-500 dark:text-ink-100">Conflict frequency</p>
            <p className="mt-2 text-2xl font-extrabold text-ink-900 dark:text-white">{loading ? "—" : `${overview.conflictFrequency}%`}</p>
          </div>
        </div>
      </ChartCard>
      <ChartCard title="Peak consultation hours" subtitle="Highest-demand start times for the past 30 days.">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={peakHours.slice(0, 7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,89,104,0.16)" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4278f5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
=======
          {(loading ? [] : conflicts).map(([label, value]) => (
            <div key={label} className="rounded-lg border border-ink-100 p-5 dark:border-white/10">
              <p className="text-sm font-semibold text-ink-500 dark:text-ink-100">{label}</p>
              <p className="mt-2 text-2xl font-extrabold text-ink-900 dark:text-white">{value}</p>
            </div>
          ))}
          {!loading && conflicts.length === 0 && (
            <div className="rounded-lg border border-ink-100 p-5 text-sm text-ink-500 dark:border-white/10 dark:text-ink-100 md:col-span-3">
              No analytics records yet. New appointment activity will populate this report.
            </div>
          )}
>>>>>>> fe1f118 (feat: integrate Supabase and enhance LFC scheduling system modules)
        </div>
      </ChartCard>
    </div>
  );
}
