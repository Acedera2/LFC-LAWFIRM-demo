import { Bell, CheckCheck, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api, { unwrap } from "../lib/api";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get("/notifications")
      .then((response) => {
        if (active) setNotifications(unwrap(response).notifications || []);
      })
      .catch(() => {
        if (active) setNotifications([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Unable to update notifications at this time.");
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">Notifications</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink-900 dark:text-white">Client, staff, lawyer, and system alerts</h1>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          disabled={loading || notifications.length === 0}
          className="focus-ring inline-flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-jade-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-jade-400 dark:text-ink-950"
        >
          <CheckCheck size={16} /> Mark all read
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : notifications.length === 0 ? (
        <EmptyState title="No notifications" message="Appointment status, document activity, and conflict alerts will appear here." />
      ) : (
        <div className="grid gap-3">
          {notifications.map((notification) => (
            <article key={notification.id} className="rounded-lg border border-ink-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-jade-100 text-jade-800 dark:bg-jade-400/15 dark:text-jade-100">
                  {notification.type === "CONFLICT" || notification.type === "Conflict" ? <ShieldAlert size={20} /> : <Bell size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-extrabold text-ink-900 dark:text-white">{notification.title}</h2>
                    {!notification.readAt && <span className="rounded-lg bg-signal-coral/12 px-2 py-1 text-xs font-extrabold text-signal-coral">Unread</span>}
                  </div>
                  <p className="mt-1 text-sm text-ink-500 dark:text-ink-100">{notification.message}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
