import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const demos = [
  ["Admin", "admin@demo.local"],
  ["Staff", "staff@demo.local"],
  ["Lawyer", "elena.rivera@demo.local"],
  ["Client", "client@demo.local"]
];

function rolePath(user) {
  const role = user.role?.slug || user.role;
  return role === "admin" ? "/admin" : role === "staff" ? "/staff" : role === "lawyer" ? "/lawyer" : "/client";
}

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "admin@demo.local", password: "Password123!" });

  const submit = async (event) => {
    event.preventDefault();
    try {
      const user = await login(form);
      // support location.state.from being either a string or a location-like object
      const fromState = location.state?.from;
      const fromPath = typeof fromState === "string" ? fromState : fromState?.pathname;
      navigate(fromPath || rolePath(user), { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <Navbar />
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <section className="hidden rounded-lg bg-hero-room bg-cover bg-center p-8 text-white shadow-soft lg:block">
          <Logo className="text-white" />
          <div className="mt-52 max-w-md">
            <p className="text-sm font-extrabold uppercase text-jade-100">Secure portal</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold">Scheduling control for every legal role.</h1>
            <p className="mt-4 text-sm leading-6 text-white/78">Secure cookie sessions, role dashboards, audit logs, and conflict-aware appointments are ready for production setup.</p>
          </div>
        </section>
        <section className="rounded-lg border border-ink-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8">
          <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">Login</p>
          <h1 className="mt-3 text-3xl font-extrabold text-ink-900 dark:text-white">Welcome back</h1>
          <p className="mt-3 text-sm leading-6 text-ink-500 dark:text-ink-100">Use a seeded demo account to enter the dashboard for your role. All demo accounts use <span className="font-bold">Password123!</span>.</p>
          <form onSubmit={submit} className="mt-8 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="focus-ring rounded-lg border border-ink-100 px-3 py-3 font-medium dark:border-white/10 dark:bg-ink-950"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Password
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="focus-ring rounded-lg border border-ink-100 px-3 py-3 font-medium dark:border-white/10 dark:bg-ink-950"
                required
              />
            </label>
            <button disabled={loading} className="focus-ring rounded-lg bg-ink-900 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-jade-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-jade-400 dark:text-ink-950" type="submit">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <div className="mt-6">
            <p className="text-xs font-extrabold uppercase text-ink-500 dark:text-ink-100">Demo accounts</p>
            <p className="mt-2 text-xs text-ink-500 dark:text-ink-100">Click a role to fill the email field, then sign in.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {demos.map(([label, email]) => (
                <button key={email} type="button" onClick={() => setForm({ email, password: "Password123!" })} className="focus-ring rounded-lg border border-ink-100 px-3 py-2 text-xs font-extrabold text-ink-700 hover:border-jade-400 hover:text-jade-700 dark:border-white/10 dark:text-white">
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-6 text-sm text-ink-500 dark:text-ink-100">
            New client? <Link to="/register" className="font-extrabold text-jade-700 dark:text-jade-100">Create an account</Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
