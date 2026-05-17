import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "../components/ChartCard";
import api, { unwrap } from "../lib/api";
import toast from "react-hot-toast";

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
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
    return () => {
      active = false;
    };
  }, []);

  const daily = summary?.dailyAppointments || [];
  const peakHours = summary?.peakConsultationHours || [];
  const overview = summary?.overview || {};

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">Analytics</p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink-900 dark:text-white">Scheduling intelligence and firm performance</h1>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
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
        </ChartCard>
      </div>
      <ChartCard title="Conflict frequency" subtitle="Tracked warnings and conflicts against the full queue.">
        <div className="grid gap-4 md:grid-cols-3">
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
        </div>
      </ChartCard>
    </div>
  );
}
