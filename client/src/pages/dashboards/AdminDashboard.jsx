import { useEffect, useState } from "react";
import { Server, Users, PieChart } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/StatCard";
import api, { unwrap } from "../../lib/api";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get("/admin/metrics")
      .then((res) => { if (!active) return; setMetrics(unwrap(res)); })
      .catch(() => { if (!active) setMetrics({}); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">Admin dashboard</p>
          <h2 className="mt-2 text-2xl font-extrabold text-ink-900 dark:text-white">System overview and control panel</h2>
          
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-ink-50 p-4 dark:bg-white/5">
              <p className="text-xs font-bold uppercase text-ink-500 dark:text-ink-100">What to review</p>
              <p className="mt-1 text-sm text-ink-700 dark:text-white">Totals, conflicts, and active work.</p>
            </div>
            <div className="rounded-2xl bg-ink-50 p-4 dark:bg-white/5">
              <p className="text-xs font-bold uppercase text-ink-500 dark:text-ink-100">What it controls</p>
              <p className="mt-1 text-sm text-ink-700 dark:text-white">Users, roles, schedules, and settings.</p>
            </div>
            <div className="rounded-2xl bg-ink-50 p-4 dark:bg-white/5">
              <p className="text-xs font-bold uppercase text-ink-500 dark:text-ink-100">Why it matters</p>
              <p className="mt-1 text-sm text-ink-700 dark:text-white">Shows how the prototype prevents confusion and overlaps.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Server} label="Uptime" value={loading ? "..." : metrics.uptime || "—"} />
          <StatCard icon={Users} label="Users" value={loading ? "..." : metrics.users || "—"} />
          <StatCard icon={PieChart} label="Active cases" value={loading ? "..." : metrics.cases || "—"} />
          <StatCard icon={PieChart} label="Conflict alerts" value={loading ? "..." : metrics.conflicts || "—"} tone="brass" />
        </section>

        <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-ink-900 dark:text-white">Recent activity</h3>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-100">The most recent changes, approvals, and alerts in one place.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {loading ? <p className="text-sm text-ink-500 dark:text-ink-100">Loading recent activity and alert history...</p> : (metrics.recent || []).length ? (metrics.recent || []).map((r, idx) => (
              <div key={idx} className="rounded-2xl border border-ink-100 bg-ink-50 p-3 text-sm dark:border-white/10 dark:bg-white/5">{r.description}</div>
            )) : <p className="text-sm text-ink-500 dark:text-ink-100">No recent activity yet. New actions will appear here during the demo.</p>}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
