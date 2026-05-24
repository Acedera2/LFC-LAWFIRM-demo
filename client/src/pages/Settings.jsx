import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Save, ShieldCheck, Users } from "lucide-react";
import toast from "react-hot-toast";

import api, { unwrap } from "../lib/api";
import { publishRefresh } from "../lib/refreshBus";
import { useAuth } from "../context/AuthContext";

import ChartCard from "../components/ChartCard";
import LoadingSkeleton from "../components/LoadingSkeleton";

const defaultSettings = [
  { key: "sessionTimeoutHours", value: 8 },
  { key: "maxBookingDays", value: 90 }
];

const settingLabels = {
  sessionTimeoutHours: "Session timeout (hours)",
  maxBookingDays: "Max booking window (days)"
};

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const isAdmin = user?.role?.slug === "admin";
  const location = useLocation();
  const q = new URLSearchParams(location.search || "");
  const activeTab = q.get("tab") || "profile";
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    title: user?.title || "",
    bio: user?.bio || ""
  });
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      title: user?.title || "",
      bio: user?.bio || ""
    });
  }, [user]);

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      if (!isAdmin) {
        setLoading(false);
        return;
      }

      try {
        if (active) setLoading(true);
        if (activeTab === "users") {
          const resp = await api.get("/users?limit=50");
          const data = unwrap(resp);
          if (active) setUsersList(data.users || []);
        } else {
          const response = await api.get("/settings");
          const data = unwrap(response);
          if (active) setSettings(data.settings?.length ? data.settings : defaultSettings);
        }
      } catch (error) {
        if (active) {
          toast.error(error.response?.data?.message || "Unable to load system settings");
          setSettings(defaultSettings);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadSettings();

    return () => { active = false; };
  }, [isAdmin, activeTab]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.put("/profile", profileForm);
      updateProfile(unwrap(response).user);
      // notify other tabs/windows to refresh profile from storage
      try { publishRefresh("profile:updated"); } catch {}
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save profile");
    } finally {
      setSubmitting(false);
    }
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await Promise.all(settings.map((setting) => api.put("/settings", { key: setting.key, value: setting.value })));
      toast.success("System settings saved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save settings");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">Settings</p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink-900 dark:text-white">Account profile and system controls</h1>
        
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ChartCard title="Account profile" subtitle="Update your visible name and contact details for the demo session.">
          <form className="grid gap-4" onSubmit={saveProfile}>
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Name
              <input required value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} className="rounded-xl border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950" />
              <span className="text-xs font-medium text-ink-500 dark:text-ink-100">This is the name shown in your sidebar and profile views.</span>
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Email
              <input required type="email" value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} className="rounded-xl border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950" />
              <span className="text-xs font-medium text-ink-500 dark:text-ink-100">Use the email you sign in with so alerts and account actions stay consistent.</span>
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Phone
              <input value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} className="rounded-xl border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950" placeholder="Optional phone number" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Title / position
              <input value={profileForm.title} onChange={(event) => setProfileForm((current) => ({ ...current, title: event.target.value }))} className="rounded-xl border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950" placeholder="Optional role title" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Profile notes
              <textarea rows={4} value={profileForm.bio} onChange={(event) => setProfileForm((current) => ({ ...current, bio: event.target.value }))} className="rounded-xl border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950" placeholder="Short bio or description" />
            </label>
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-jade-800 disabled:opacity-60 dark:bg-jade-400 dark:text-ink-950">
              <Save size={16} /> {submitting ? "Saving..." : "Save profile"}
            </button>
          </form>
        </ChartCard>

        <ChartCard title="Security policy" subtitle={isAdmin ? "Session duration, alert thresholds, and limits." : "Your current account settings and security notes."}>
          {loading ? (
            <LoadingSkeleton rows={4} />
          ) : isAdmin ? (
            activeTab === "users" ? (
              <div>
                <h2 className="text-lg font-extrabold">Users</h2>
                <div className="mt-4 grid gap-3">
                  {usersList.map((u) => (
                    <div key={u.id} className="rounded-xl border border-ink-100 p-3 dark:border-white/10">
                      <p className="font-extrabold">{u.name}</p>
                      <p className="text-sm text-ink-500">{u.email}</p>
                      <p className="text-xs text-ink-400">Role: {u.role?.slug || (u.roleId ? u.roleId : 'client')}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form className="grid gap-4" onSubmit={saveSettings}>
                {settings.map((setting) => (
                  <label key={setting.key} className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
                    {settingLabels[setting.key] || setting.key}
                    <input value={String(setting.value)} onChange={(event) => setSettings((current) => current.map((item) => item.key === setting.key ? { ...item, value: event.target.value } : item))} className="rounded-xl border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950" />
                    <span className="text-xs font-medium text-ink-500 dark:text-ink-100">Adjust this only if you want to change the demo policy for the whole workspace.</span>
                  </label>
                ))}
                <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-jade-800 disabled:opacity-60 dark:bg-jade-400 dark:text-ink-950">
                  <Save size={16} /> {submitting ? "Saving..." : "Save settings"}
                </button>
              </form>
            )
          ) : (
            <div className="grid gap-4">
              <div className="rounded-xl border border-ink-100 p-4 dark:border-white/10">
                <p className="text-sm text-ink-500 dark:text-ink-100">Session timeout</p>
                <p className="mt-2 font-extrabold text-ink-900 dark:text-white">8 hours</p>
              </div>
              <div className="rounded-xl border border-ink-100 p-4 dark:border-white/10">
                <p className="text-sm text-ink-500 dark:text-ink-100">Two-factor authentication</p>
                <p className="mt-2 font-extrabold text-ink-900 dark:text-white">Recommended for administrators</p>
              </div>
              <div className="rounded-xl border border-ink-100 p-4 dark:border-white/10">
                <p className="text-sm text-ink-500 dark:text-ink-100">Need to update something?</p>
                <p className="mt-2 font-extrabold text-ink-900 dark:text-white">Edit your profile fields on the left, then save once.</p>
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {isAdmin && (
        <ChartCard title="Users and roles" subtitle="Administrative access and permissions overview.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Elena Rivera", "Lawyer", "Active"],
              ["Nora Valdez", "Staff", "Active"],
              ["Mina Santos", "Client", "Verified"],
              ["Admin Operations", "Admin", "Protected"]
            ].map(([name, role, status]) => (
              <div key={name} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-100 p-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-jade-100 text-jade-800 dark:bg-jade-400/15 dark:text-jade-100">
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
      )}
    </div>
  );
}