import { useEffect, useState } from "react";
import { Save, ShieldCheck, Users } from "lucide-react";
import toast from "react-hot-toast";
import api, { unwrap } from "../lib/api";
import ChartCard from "../components/ChartCard";
import LoadingSkeleton from "../components/LoadingSkeleton";

export default function Settings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get("/settings")
      .then((response) => {
        if (active) setSettings(unwrap(response).settings || []);
      })
      .catch(() => {
        if (active) setSettings([]);
        toast.error("Could not load system settings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateSetting = async (key, value) => {
    try {
      const response = await api.put("/settings", { key, value });
      const updated = unwrap(response).setting;
      setSettings((current) => current.map((item) => (item.key === updated.key ? updated : item)));
      toast.success("Settings updated");
    } catch {
      toast.error("Unable to save setting.");
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await Promise.all(
        settings.map(async (setting) => {
          await updateSetting(setting.key, setting.value);
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">Settings</p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink-900 dark:text-white">System settings and administration</h1>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <ChartCard title="Security policy" subtitle="Session duration, appointment caps, and alert thresholds.">
          {loading ? (
            <LoadingSkeleton rows={4} />
          ) : (
            <form className="grid gap-4" onSubmit={handleSave}>
              {settings.map((setting) => (
                <label key={setting.key} className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
                  {setting.key}
                  <input
                    value={String(setting.value)}
                    onChange={(event) => setSettings((current) => current.map((item) => (item.key === setting.key ? { ...item, value: event.target.value } : item)))}
                    className="focus-ring rounded-3xl border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950"
                  />
                </label>
              ))}
              <button
                type="submit"
                disabled={submitting}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-3xl bg-ink-900 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-jade-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-jade-400 dark:text-ink-950"
              >
                <Save size={16} /> {submitting ? "Saving..." : "Save settings"}
              </button>
            </form>
          )}
        </ChartCard>
        <ChartCard title="Users and roles" subtitle="Administrators can manage client, staff, lawyer, and admin permissions.">
          <div className="grid gap-3">
            {[
              ["Elena Rivera", "Lawyer", "Active"],
              ["Nora Valdez", "Staff", "Active"],
              ["Mina Santos", "Client", "Verified"],
              ["Admin Operations", "Admin", "Protected"]
            ].map(([name, role, status]) => (
              <div key={name} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-ink-100 p-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-jade-100 text-jade-800 dark:bg-jade-400/15 dark:text-jade-100">
                    {role === "Admin" ? <ShieldCheck size={18} /> : <Users size={18} />}
                  </div>
                  <div>
                    <p className="font-extrabold text-ink-900 dark:text-white">{name}</p>
                    <p className="text-sm text-ink-500 dark:text-ink-100">{role}</p>
                  </div>
                </div>
                <span className="rounded-lg bg-ink-50 px-2.5 py-1 text-xs font-extrabold text-ink-600 dark:bg-white/10 dark:text-white">{status}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
