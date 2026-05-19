import { Award, Building2, Clock, ShieldCheck } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const values = [
  [ShieldCheck, "Confidential by design", "Protected intake, role access, and audit history are treated as core workflows."],
  [Clock, "Deadline-aware", "Priority rules keep emergency matters and court windows visible to the right people."],
  [Building2, "Field-ready", "The platform supports office consultations, remote sessions, and site verification work."],
  [Award, "Executive clarity", "Analytics turn appointment volume and workload pressure into operational decisions."]
];

export default function About() {
  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">About</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-ink-900 dark:text-white sm:text-5xl">A legal operations platform built around trust, timing, and accountability.</h1>
          <p className="mt-6 text-lg leading-8 text-ink-600 dark:text-ink-100">
            LFC Legal Appointment System centralizes the operational work around consultation requests so clients, lawyers, staff, and administrators can coordinate without losing context.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {values.map(([Icon, title, body]) => (
            <article key={title} className="rounded-lg border border-ink-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <Icon className="text-jade-700 dark:text-jade-100" size={26} />
              <h2 className="mt-4 text-lg font-extrabold text-ink-900 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-500 dark:text-ink-100">{body}</p>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
