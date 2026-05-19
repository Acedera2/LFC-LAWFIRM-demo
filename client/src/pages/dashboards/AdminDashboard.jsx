import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CalendarRange, Gauge, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "../../components/ChartCard";
import StatCard from "../../components/StatCard";
import api, { unwrap } from "../../lib/api";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const colors = ["#34c48f", "#b9862d", "#4b7bec", "#e76f51", "#7c6cf6", "#22c55e"];

  useEffect(() => {
    let active = true;
    const loadSummary = async () => {
      try {
        const response = await api.get("/analytics/summary");
        const data = unwrap(response);
        if (active) setSummary(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (active) setSummary((current) => current);
      }
    };
    loadSummary();
    return () => {
      active = false;
    };
  }, []);

  const overview = summary?.overview || {};
  const appointments = summary?.dailyAppointments || [];
  const workload = summary?.workloadDistribution || [];
  const peakHours = summary?.peakConsultationHours || [];

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Tracked lawyers" value={(summary?.appointmentsPerLawyer?.length || 0).toString()} trend="Live capacity overview" />
        <StatCard icon={CalendarRange} label="Appointments" value={overview.totalAppointments?.toString() || "—"} trend={overview.completionRate ? `${overview.completionRate}% completion rate` : "Loading..."} tone="blue" />
        <StatCard icon={AlertTriangle} label="Conflict alerts" value={overview.conflictCount?.toString() || "—"} trend={overview.conflictFrequency ? `${overview.conflictFrequency}% of schedule` : "Loading..."} tone="coral" />
        <StatCard icon={Gauge} label="Completed" value={overview.completedAppointments?.toString() || "—"} trend="Operational throughput" tone="brass" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Appointments and peaks" subtitle="Daily operational volume and delivery pressure.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={appointments}>
                <defs>
                  <linearGradient id="appointments" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#34c48f" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#34c48f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,89,104,0.16)" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#12805c" fill="url(#appointments)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="Lawyer workload" subtitle="How appointment duties are shared across the team.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={workload} dataKey="appointments" nameKey="lawyerName" innerRadius={70} outerRadius={110} paddingAngle={4}>
                  {workload.map((entry, index) => (<Cell key={entry.lawyerId} fill={colors[index % colors.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
      <ChartCard title="Peak consultation hours" subtitle="Top demand windows for consultant staffing.">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={peakHours.slice(0, 7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,89,104,0.16)" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#b9862d" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
      <ChartCard title="System activity" subtitle="Audit logs and operational events feed the compliance dashboard.">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-ink-100 p-4 dark:border-white/10">
            <Activity className="text-jade-700 dark:text-jade-100" size={20} />
            <span className="text-sm font-bold text-ink-900 dark:text-white">Auditing enabled</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-ink-100 p-4 dark:border-white/10">
            <Activity className="text-jade-700 dark:text-jade-100" size={20} />
            <span className="text-sm font-bold text-ink-900 dark:text-white">Role-based access</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-ink-100 p-4 dark:border-white/10">
            <Activity className="text-jade-700 dark:text-jade-100" size={20} />
            <span className="text-sm font-bold text-ink-900 dark:text-white">Conflict scanning active</span>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
