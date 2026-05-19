import { Bell, CalendarDays, ChartNoAxesCombined, Cog, LayoutDashboard, LogOut, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

const roleHome = {
  client: "/client",
  lawyer: "/lawyer",
  staff: "/staff",
  admin: "/admin"
};

export default function DashboardShell() {
  const { user, logout } = useAuth();
  const role = user?.role?.slug || user?.role || "client";
  const navItems = [
    { label: "Dashboard", to: roleHome[role] || "/client", icon: LayoutDashboard },
    ...(role === "client" ? [{ label: "Appointments", to: "/appointments", icon: CalendarDays }] : []),
    ...(role === "staff" || role === "admin" ? [{ label: "Appointments", to: "/appointments", icon: CalendarDays }] : []),
    ...(role === "staff" || role === "admin" ? [{ label: "Clients", to: "/clients", icon: Users }] : []),
    { label: "Notifications", to: "/notifications", icon: Bell },
    ...(role === "lawyer" || role === "staff" || role === "admin" ? [{ label: "Analytics", to: "/analytics", icon: ChartNoAxesCombined }] : []),
    ...(role === "admin" ? [{ label: "People", to: "/settings?tab=users", icon: Users }] : []),
    ...(role === "admin" ? [{ label: "Settings", to: "/settings", icon: Cog }] : [])
  ];

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-ink-100 bg-white p-5 lg:block dark:border-white/10 dark:bg-ink-900">
        <Logo />
        <div className="mt-8 rounded-lg bg-ink-50 p-4 dark:bg-white/5">
          <p className="text-xs font-extrabold uppercase text-ink-500 dark:text-ink-100">Signed in as</p>
          <p className="mt-1 text-sm font-extrabold text-ink-900 dark:text-white">{user?.name}</p>
          <p className="text-xs font-semibold capitalize text-jade-700 dark:text-jade-100">{role}</p>
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
        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
          <ThemeToggle />
          <button type="button" onClick={logout} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-ink-100 px-3 py-2 text-sm font-bold text-ink-700 hover:text-signal-coral dark:border-white/10 dark:text-white">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink-100 bg-white/92 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/88 lg:px-8">
          <div className="lg:hidden"><Logo compact /></div>
          <div>
            <p className="text-xs font-extrabold uppercase text-ink-500 dark:text-ink-100">Workspace</p>
            <h1 className="text-lg font-extrabold text-ink-900 dark:text-white">Legal Operations Command Center</h1>
          </div>
          <div className="flex items-center gap-2 lg:hidden"><ThemeToggle /></div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className="shrink-0 rounded-lg border border-ink-100 bg-white px-3 py-2 text-xs font-bold dark:border-white/10 dark:bg-white/5">
                {item.label}
              </NavLink>
            ))}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
