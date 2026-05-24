import { useEffect, useState } from "react";
import { Bell, CheckCheck, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api, { unwrap } from "../lib/api";
import { subscribeRefresh } from "../lib/refreshBus";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { isSupabaseEnabled, supabase } from "../lib/supabase";

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    let active = true;
    const loadNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        const data = unwrap(response);
        if (active) setNotifications(data.notifications || []);
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Please sign in to view notifications");
          navigate("/login", { state: { from: "/notifications" } });
          return;
        }
        toast.error(error.response?.data?.message || "Unable to fetch notifications");
      } finally {
        if (active) setLoading(false);
      }
    };

    const onNotificationsUpdated = () => { loadNotifications(); };

    loadNotifications();
    const unsubscribe = subscribeRefresh("notifications:updated", onNotificationsUpdated);
    return () => { active = false; unsubscribe(); };
  }, [navigate, user?.id]);

  const markAllRead = async () => {
    try {
      if (isSupabaseEnabled && supabase && user?.id) {
        const { error } = await supabase
          .from("notifications")
          .update({ read_at: new Date().toISOString() })
          .eq("profile_id", user.id)
          .is("read_at", null);
        if (error) throw error;
      } else {
        await api.patch("/notifications/read-all");
        setNotifications((current) => current.map((notification) => ({ ...notification, readAt: new Date().toISOString() })));
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please sign in to update notifications");
        navigate("/login", { state: { from: "/notifications" } });
        return;
      }
      toast.error(error.response?.data?.message || "Unable to update notifications");
    }
  };

  const openNotification = async (notification) => {
    setSelectedNotification(notification);
    if (!notification.readAt) {
      try {
        if (isSupabaseEnabled && supabase && user?.id) {
          const { error } = await supabase
            .from("notifications")
            .update({ read_at: new Date().toISOString() })
            .eq("id", notification.id)
            .eq("profile_id", user.id)
            .is("read_at", null);
          if (error) throw error;
        } else {
          await api.patch(`/notifications/${notification.id}/read`);
        }
        setNotifications((current) => current.map((item) => (item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item)));
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to mark notification as read");
      }
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">Notifications</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink-900 dark:text-white">Client, staff, lawyer, and system alerts</h1>
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-100">Tap any notification to read the full message, then mark the set as read when you are done.</p>
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
          <p className="text-xs font-semibold text-ink-500 dark:text-ink-100">{notifications.filter((notification) => !notification.readAt).length} unread of {notifications.length} total notifications.</p>
          {notifications.map((notification) => (
            <button key={notification.id} type="button" onClick={() => openNotification(notification)} className="rounded-lg border border-ink-100 bg-white p-0 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5">
              <div className="flex items-start gap-4 p-5">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-jade-100 text-jade-800 dark:bg-jade-400/15 dark:text-jade-100">
                  {notification.type === "CONFLICT" || notification.type === "Conflict" ? <ShieldAlert size={20} /> : <Bell size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-extrabold text-ink-900 dark:text-white">{notification.title}</h2>
                    {!notification.readAt && <span className="rounded-lg bg-signal-coral/12 px-2 py-1 text-xs font-extrabold text-signal-coral">Unread</span>}
                  </div>
                  <p className="mt-1 text-sm text-ink-500 dark:text-ink-100 line-clamp-2">{notification.message}</p>
                  <p className="mt-3 text-xs font-bold text-jade-700 dark:text-jade-100">Open to read full details</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal open={Boolean(selectedNotification)} title={selectedNotification?.title || "Notification"} onClose={() => setSelectedNotification(null)}>
        {selectedNotification ? (
          <div className="grid gap-4">
            <div className="rounded-lg bg-ink-50 p-4 dark:bg-white/5">
              <p className="text-sm font-bold text-ink-500 dark:text-ink-100">Message</p>
              <p className="mt-2 text-sm leading-6 text-ink-900 dark:text-white">{selectedNotification.message}</p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-ink-500 dark:text-ink-100">
              <span>{selectedNotification.type || "Notification"}</span>
              <span>{selectedNotification.createdAt ? new Date(selectedNotification.createdAt).toLocaleString() : "Recently"}</span>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
