import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import clsx from "clsx";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

const links = [
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Lawyers", to: "/lawyers" },
  { label: "Contact", to: "/contact" }
];

function DashboardLink({ user }) {
  if (!user) return null;
  const role = user.role?.slug || user.role;
  const path = role === "admin" ? "/admin" : role === "staff" ? "/staff" : role === "lawyer" ? "/lawyer" : "/client";
  return (
    <Link
      to={path}
      className="focus-ring rounded-lg bg-ink-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-jade-800 dark:bg-jade-400 dark:text-ink-950 dark:hover:bg-jade-100"
    >
      Dashboard
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-ink-950/88">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Logo />
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  "rounded-lg px-3 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-jade-100 text-jade-800 dark:bg-jade-400/15 dark:text-jade-100"
                    : "text-ink-600 hover:bg-ink-50 hover:text-ink-900 dark:text-ink-100 dark:hover:bg-white/10 dark:hover:text-white"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {user ? (
            <>
              <DashboardLink user={user} />
              <button
                type="button"
                onClick={logout}
                className="focus-ring rounded-lg border border-ink-100 px-4 py-2 text-sm font-bold text-ink-700 transition hover:border-signal-coral hover:text-signal-coral dark:border-white/10 dark:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="focus-ring rounded-lg px-4 py-2 text-sm font-bold text-ink-700 transition hover:bg-ink-50 dark:text-white dark:hover:bg-white/10" to="/login">
                Login
              </Link>
              <Link className="focus-ring rounded-lg bg-ink-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-jade-800 dark:bg-jade-400 dark:text-ink-950" to="/register">
                Book consult
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink-100 bg-white text-ink-900 lg:hidden dark:border-white/10 dark:bg-white/10 dark:text-white"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Close mobile menu" : "Open mobile menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-ink-100 bg-white px-4 py-4 shadow-soft lg:hidden dark:border-white/10 dark:bg-ink-950 lg:shadow-none">
          <div className="grid gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50 dark:text-white dark:hover:bg-white/10"
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                <>
                  <DashboardLink user={user} />
                  <button type="button" onClick={logout} className="rounded-lg border border-ink-100 px-4 py-2 text-sm font-bold dark:border-white/10">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="rounded-lg border border-ink-100 px-4 py-2 text-sm font-bold dark:border-white/10">
                    Login
                  </Link>
                  <Link to="/register" className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-bold text-white dark:bg-jade-400 dark:text-ink-950">
                    Book consult
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
