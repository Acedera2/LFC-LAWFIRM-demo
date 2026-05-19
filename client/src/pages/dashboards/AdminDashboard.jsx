<<<<<<< HEAD
import { useEffect, useState } from "react";
=======
import { useEffect, useMemo, useState } from "react";
>>>>>>> fe1f118 (feat: integrate Supabase and enhance LFC scheduling system modules)
import { Activity, AlertTriangle, CalendarRange, Gauge, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "../../components/ChartCard";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import StatCard from "../../components/StatCard";
import api, { unwrap } from "../../lib/api";
<<<<<<< HEAD

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
=======

const colors = ["#34c48f", "#e3bd5e", "#4278f5", "#e66f5c"];

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/analytics/summary"), api.get("/analytics/audit-logs")])
      .then(([summaryResponse, logsResponse]) => {
        if (!active) return;
        setSummary(unwrap(summaryResponse));
        setLogs(unwrap(logsResponse).logs || []);
      })
      .catch(() => {
        if (!active) return;
        setSummary(null);
        setLogs([]);
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
  const overview = summary?.overview || {};
  const appointments = summary?.dailyAppointments || [];
  const workload = summary?.workloadDistribution || [];
  const peakHours = summary?.peakConsultationHours || [];
=======
  const analyticsSeries = useMemo(() => {
    if (!summary) return [];
    const conflictsByDate = (summary.dailyLawyerWorkload || []).reduce((acc, item) => {
      acc[item.date] = (acc[item.date] || 0) + (item.conflicts || 0);
      return acc;
    }, {});
    return (summary.dailyAppointments || []).map((item) => ({
      name: item.date.slice(5),
      appointments: item.count,
      conflicts: conflictsByDate[item.date] || 0
    }));
  }, [summary]);

  const workloadDistribution = useMemo(() => {
    const source = summary?.workloadDistribution || [];
    return source.map((item) => ({ name: item.lawyerName, value: item.appointments }));
  }, [summary]);

  const peakConsultationHours = summary?.peakConsultationHours?.slice(0, 6) || [];
>>>>>>> fe1f118 (feat: integrate Supabase and enhance LFC scheduling system modules)

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
<<<<<<< HEAD
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
=======
        <StatCard icon={Users} label="Active users" value={loading ? "..." : `${logs.filter((item) => item.entity === "User").length || 0}`} trend="Role and policy events" />
        <StatCard icon={CalendarRange} label="Appointments" value={loading ? "..." : `${summary?.overview?.totalAppointments || 0}`} trend={`${summary?.overview?.completionRate || 0}% completion rate`} tone="blue" />
        <StatCard icon={AlertTriangle} label="Conflicts" value={loading ? "..." : `${summary?.overview?.conflictCount || 0}`} trend={`${summary?.overview?.conflictFrequency || 0}% frequency`} tone="coral" />
        <StatCard icon={Gauge} label="Avg workload" value={loading ? "..." : `${Math.round((summary?.overview?.totalAppointments || 0) / Math.max((summary?.workloadDistribution || []).length || 1, 1))}`} trend="Appointments per counsel" tone="brass" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Appointments and conflicts" subtitle="Daily operational volume with detected schedule conflicts.">
          {loading ? (
            <LoadingSkeleton rows={4} />
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsSeries}>
                  <defs>
                    <linearGradient id="appointments" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#34c48f" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#34c48f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,89,104,0.16)" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="appointments" stroke="#12805c" fill="url(#appointments)" />
                  <Area type="monotone" dataKey="conflicts" stroke="#e66f5c" fill="#e66f5c22" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
        <ChartCard title="Workload distribution" subtitle="Appointments per lawyer and field consultant.">
          {loading ? (
            <LoadingSkeleton rows={4} />
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={workloadDistribution} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                    {workloadDistribution.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
      <ChartCard title="Peak consultation hours" subtitle="Aggregate demand by start hour for staffing decisions.">
        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakConsultationHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,89,104,0.16)" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#b9862d" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
>>>>>>> fe1f118 (feat: integrate Supabase and enhance LFC scheduling system modules)
      </ChartCard>
      <ChartCard title="System activity" subtitle="Audit logs and operational events feed the compliance dashboard.">
        <div className="grid gap-3 md:grid-cols-3">
<<<<<<< HEAD
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
=======
          {(loading ? [] : logs.slice(0, 3).map((item) => item.action.replaceAll("_", " "))).map((event) => (
            <div key={event} className="flex items-center gap-3 rounded-lg border border-ink-100 p-4 dark:border-white/10">
              <Activity className="text-jade-700 dark:text-jade-100" size={20} />
              <span className="text-sm font-bold text-ink-900 dark:text-white">{event}</span>
            </div>
          ))}
          {!loading && logs.length === 0 && (
            <div className="rounded-lg border border-ink-100 p-4 text-sm text-ink-500 dark:border-white/10 dark:text-ink-100 md:col-span-3">
              No audit logs found yet.
            </div>
          )}
>>>>>>> fe1f118 (feat: integrate Supabase and enhance LFC scheduling system modules)
        </div>
      </ChartCard>
    </div>
  );
}
