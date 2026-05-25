import { Bell, CalendarDays, ChartNoAxesCombined, Cog, LayoutDashboard, LogOut, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { subscribeRefresh } from "../lib/refreshBus";
import { useEffect } from "react";

const roleHome = {
  client: "/client",
  lawyer: "/lawyer",
  staff: "/staff",
  admin: "/admin"
};

export default function DashboardShell() {
  const { user, logout } = useAuth();
  const role = user?.role?.slug || user?.role || "client";
  const roleLabel = role === "admin" ? "Admin" : role === "staff" ? "Staff" : role === "lawyer" ? "Lawyer" : "Client";
  const roleSummary = {
    client: "Submit inquiries, check schedules, and track your appointments.",
    lawyer: "Review assigned consultations and manage your daily schedule.",
    staff: "Coordinate requests, assign lawyers, and monitor conflicts.",
    admin: "Oversee all appointments, users, settings, and conflict alerts."
  };
  const navItems = [
    { label: "Dashboard", to: roleHome[role] || "/client", icon: LayoutDashboard },
    ...(role === "staff" || role === "admin" ? [{ label: "Appointments", to: "/appointments", icon: CalendarDays }] : []),
    ...(role === "staff" || role === "admin" ? [{ label: "Clients", to: "/clients", icon: Users }] : []),
    { label: "Notifications", to: "/notifications", icon: Bell },
    ...(role === "lawyer" || role === "staff" || role === "admin" ? [{ label: "Analytics", to: "/analytics", icon: ChartNoAxesCombined }] : []),
    { label: "Settings", to: `/${role}/settings`, icon: Cog }
  ];

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-ink-100 bg-white p-5 dark:border-white/10 dark:bg-ink-900 lg:block">
        {/* listen for profile updates from other tabs/windows */}
        {typeof window !== 'undefined' && (
          <ProfileSync />
        )}
        <Logo />
        <div className="mt-6 rounded-2xl border border-ink-100 bg-ink-50 p-4 dark:border-white/10 dark:bg-white/5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink-500 dark:text-ink-100">Current role</p>
          <p className="mt-1 text-sm font-extrabold text-ink-900 dark:text-white">{roleLabel} workspace</p>
          <p className="mt-2 text-xs leading-5 text-ink-500 dark:text-ink-100">{roleSummary[role] || roleSummary.client}</p>
          <div className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-ink-600 shadow-sm dark:bg-ink-950 dark:text-ink-100">
            Signed in as {user?.name || "User"}
          </div>
        </div>
        <nav className="mt-6 grid gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.label === "Dashboard"}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition",
                  isActive
                    ? "bg-jade-100 text-jade-800 dark:bg-jade-400/15 dark:text-jade-100"
                    : "text-ink-600 hover:bg-ink-50 hover:text-ink-900 dark:text-ink-100 dark:hover:bg-white/10 dark:hover:text-white"
                )
              }
            >
              <item.icon size={18} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3">
          <ThemeToggle />
          <button type="button" onClick={logout} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-ink-100 px-3 py-2 text-sm font-bold text-ink-700 hover:text-signal-coral dark:border-white/10 dark:text-white">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/92 backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/88">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden"><Logo compact /></div>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink-500 dark:text-ink-100">Workspace</p>
              <h2 className="truncate text-lg font-extrabold text-ink-900 dark:text-white">Legal Operations Command Center</h2>
              <p className="mt-1 hidden text-sm text-ink-500 dark:text-ink-100 sm:block">{roleLabel} view - {roleSummary[role] || roleSummary.client}</p>
            </div>
            <div className="flex items-center gap-2 lg:hidden"><ThemeToggle /></div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 rounded-3xl border border-ink-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 lg:hidden">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink-500 dark:text-ink-100">Current role</p>
            <p className="mt-1 text-base font-extrabold text-ink-900 dark:text-white">{roleLabel} workspace</p>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-100">{roleSummary[role] || roleSummary.client}</p>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className="shrink-0 rounded-lg border border-ink-100 bg-white px-3 py-2 text-xs font-bold dark:border-white/10 dark:bg-white/5">
                {item.label}
              </NavLink>
            ))}
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function ProfileSync() {
  const { updateProfile } = useAuth();
  // subscribe to profile updates published by other tabs
  useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem('lfc_user');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const u = parsed.user || parsed;
        if (u) updateProfile(u);
      } catch {
        // ignore
      }
    };
    const unsub = subscribeRefresh('profile:updated', handler);
    return unsub;
  }, [updateProfile]);
  return null;
}
