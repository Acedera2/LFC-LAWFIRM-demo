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
    api.get("/api/admin/metrics")
      .then((res) => { if (!active) return; setMetrics(unwrap(res)); })
      .catch(() => { if (!active) setMetrics({}); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Server} label="Uptime" value={loading ? "..." : metrics.uptime || "—"} />
          <StatCard icon={Users} label="Users" value={loading ? "..." : metrics.users || "—"} />
          <StatCard icon={PieChart} label="Active cases" value={loading ? "..." : metrics.cases || "—"} />
        </div>

        <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm">
          <h3 className="font-extrabold">Recent activity</h3>
          <div className="mt-4 grid gap-3">
            {loading ? <p>Loading...</p> : (metrics.recent || []).map((r, idx) => (
              <div key={idx} className="rounded p-3 border">{r.description}</div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
