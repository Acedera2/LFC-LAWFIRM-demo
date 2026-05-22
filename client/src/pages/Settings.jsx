import { useEffect, useMemo, useState } from "react";
import { Save, ShieldCheck, Users } from "lucide-react";
import toast from "react-hot-toast";

import api, { unwrap } from "../lib/api";
import { useAuth } from "../context/AuthContext";

import ChartCard from "../components/ChartCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { buildClientTimeline } from "../features/appointments/mappers";

export default function Settings() {
  const { user } = useAuth();

  const [settings, setSettings] = useState([]);
  const [users] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 1 });
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const timeline = useMemo(() => buildClientTimeline(clientAppointments), [clientAppointments]);

  const isAdmin = user?.role?.slug === "admin";

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        const response = await api.get("/api/settings");
        const data = unwrap(response);

        if (active) {
          setSettings(data.settings || []);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Unable to load system settings"
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (isAdmin) {
      loadSettings();
    } else {
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [isAdmin]);

  const updateSetting = async (key, value) => {
    try {
      const response = await api.put("/settings", {
        key,
        value,
      });

      const updated = unwrap(response).setting;

      setSettings((current) =>
        current.map((item) =>
          item.key === updated.key ? updated : item
        )
      );

      toast.success("Setting updated");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to save setting"
      );
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setSubmitting(true);

    try {
      await Promise.all(
        settings.map((setting) =>
          updateSetting(setting.key, setting.value)
        )
      );

      toast.success("All settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Account preferences"
          subtitle="View your account information."
        >
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Name
              <input
                value={user?.name || ""}
                disabled
                className="rounded-xl border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Email
              <input
                value={user?.email || ""}
                disabled
                className="rounded-xl border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Role
              <input
                value={user?.role?.name || ""}
                disabled
                className="rounded-xl border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950"
              />
            </label>
          </div>
        </ChartCard>

        <ChartCard
          title="Security settings"
          subtitle="Current account protection settings."
        >
          <div className="grid gap-4">
            <div className="rounded-xl border border-ink-100 p-4 dark:border-white/10">
              <p className="text-sm text-ink-500 dark:text-ink-100">
                Session timeout
              </p>

              <p className="mt-2 font-extrabold text-ink-900 dark:text-white">
                8 hours
              </p>
            </div>

            <div className="rounded-xl border border-ink-100 p-4 dark:border-white/10">
              <p className="text-sm text-ink-500 dark:text-ink-100">
                Two-factor authentication
              </p>

              <p className="mt-2 font-extrabold text-ink-900 dark:text-white">
                Recommended for administrators
              </p>
            </div>
          </div>
        </ChartCard>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">
          Settings
        </p>

        <h1 className="mt-1 text-2xl font-extrabold text-ink-900 dark:text-white">
          System settings and administration
        </h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <ChartCard
          title="Security policy"
          subtitle="Session duration, alert thresholds, and limits."
        >
          {loading ? (
            <LoadingSkeleton rows={4} />
          ) : (
            <form className="grid gap-4" onSubmit={handleSave}>
              {settings.map((setting) => (
                <label
                  key={setting.key}
                  className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white"
                >
                  {setting.key}

                  <input
                    value={String(setting.value)}
                    onChange={(event) =>
                      setSettings((current) =>
                        current.map((item) =>
                          item.key === setting.key
                            ? {
                                ...item,
                                value: event.target.value,
                              }
                            : item
                        )
                      )
                    }
                    className="rounded-xl border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950"
                  />
                </label>
              ))}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-jade-800 disabled:opacity-60 dark:bg-jade-400 dark:text-ink-950"
              >
                <Save size={16} />

                {submitting ? "Saving..." : "Save settings"}
              </button>
            </form>
          )}
        </ChartCard>

        <ChartCard
          title="Users and roles"
          subtitle="Administrative access and permissions overview."
        >
          <div className="grid gap-3">
            {[
              ["Elena Rivera", "Lawyer", "Active"],
              ["Nora Valdez", "Staff", "Active"],
              ["Mina Santos", "Client", "Verified"],
              ["Admin Operations", "Admin", "Protected"],
            ].map(([name, role, status]) => (
              <div
                key={name}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-100 p-4 dark:border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-jade-100 text-jade-800 dark:bg-jade-400/15 dark:text-jade-100">
                    {role === "Admin" ? (
                      <ShieldCheck size={18} />
                    ) : (
                      <Users size={18} />
                    )}
                  </div>

                  <div>
                    <p className="font-extrabold text-ink-900 dark:text-white">
                      {name}
                    </p>

                    <p className="text-sm text-ink-500 dark:text-ink-100">
                      {role}
                    </p>
                  </div>
                </div>

                <span className="rounded-lg bg-ink-50 px-2.5 py-1 text-xs font-extrabold text-ink-600 dark:bg-white/10 dark:text-white">
                  {status}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between text-xs font-semibold text-ink-500 dark:text-ink-100">
              <span>Total users: {meta.totalItems || users.length}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={meta.page <= 1}
                  onClick={() => setMeta((current) => ({ ...current, page: current.page - 1 }))}
                  className="rounded-lg border border-ink-100 px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10"
                >
                  Prev
                </button>
                <span>Page {meta.page} / {meta.totalPages || 1}</span>
                <button
                  type="button"
                  disabled={meta.page >= (meta.totalPages || 1)}
                  onClick={() => setMeta((current) => ({ ...current, page: current.page + 1 }))}
                  className="rounded-lg border border-ink-100 px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10"
                >
                  Next
                </button>
              </div>
            </div>
            {selectedClient && (
              <div className="rounded-3xl border border-ink-100 p-4 dark:border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-ink-900 dark:text-white">{selectedClient.name} consultation timeline</p>
                    <p className="text-xs text-ink-500 dark:text-ink-100">Inquiry to scheduling to recurring updates to completion</p>
                  </div>
                  <button type="button" onClick={() => setSelectedClient(null)} className="text-xs font-extrabold text-ink-500 dark:text-ink-100">Close</button>
                </div>
                <div className="mt-3 grid gap-2">
                  {timeline.length === 0 ? (
                    <p className="text-xs text-ink-500 dark:text-ink-100">No consultation timeline records found.</p>
                  ) : (
                    timeline.slice(-10).map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2 text-xs dark:border-white/10">
                        <span className="font-bold text-ink-900 dark:text-white">{item.action.replaceAll("_", " ")}</span>
                        <span className="text-ink-500 dark:text-ink-100">{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}