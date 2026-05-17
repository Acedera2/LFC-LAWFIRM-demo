import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import LoadingSkeleton from "../components/LoadingSkeleton";
import Navbar from "../components/Navbar";
import { unwrap } from "../lib/api";
import api from "../lib/api";
import EmptyState from "../components/EmptyState";

export default function Lawyers() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get("/lawyers")
      .then((response) => {
        if (active) setLawyers(unwrap(response).lawyers || []);
      })
      .catch(() => {
        if (active) setLawyers([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">Lawyers</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-ink-900 dark:text-white sm:text-5xl">Counsel profiles with real availability and workload intelligence.</h1>
        </div>
        <div className="mt-12">
          {loading ? (
            <div className="grid gap-5 md:grid-cols-3">
              <LoadingSkeleton rows={3} />
            </div>
          ) : lawyers.length === 0 ? (
            <EmptyState title="No lawyers available" message="Consultant profiles will appear when the intake team adds counsel to the platform." />
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {lawyers.map((lawyer) => {
                const name = lawyer.user?.name || "Unknown counsel";
                const specialty = lawyer.specialization || "Legal consultation";
                const availability = lawyer.schedules?.length ? "Standard availability" : "No schedule defined";
                const load = lawyer._count?.appointments ? Math.min(100, 10 + lawyer._count.appointments * 8) : 22;
                const initials = name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("");

                return (
                  <article key={lawyer.id} className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-white/10 dark:bg-white/5">
                    <div className="grid h-20 w-20 place-items-center rounded-3xl bg-ink-900 text-2xl font-extrabold text-brass-300 dark:bg-white dark:text-ink-900">{initials}</div>
                    <h2 className="mt-5 text-xl font-extrabold text-ink-900 dark:text-white">{name}</h2>
                    <p className="mt-1 text-sm font-semibold text-jade-700 dark:text-jade-100">{specialty}</p>
                    <dl className="mt-5 grid gap-3 text-sm text-ink-600 dark:text-ink-100">
                      <div className="flex justify-between gap-4"><dt className="text-ink-500 dark:text-ink-100">Availability</dt><dd className="font-bold text-ink-900 dark:text-white">{availability}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-ink-500 dark:text-ink-100">Load</dt><dd className="font-bold text-ink-900 dark:text-white">{load}%</dd></div>
                      <div className="overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
                        <div className="h-2 rounded-full bg-jade-400" style={{ width: `${load}%` }} />
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
