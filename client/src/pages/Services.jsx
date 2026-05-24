import { ArrowRight, BriefcaseBusiness, FileSearch, Gavel, Home, Landmark, Sparkles, UsersRound } from "lucide-react";
import toast from "react-hot-toast";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const serviceGroups = [
  [Gavel, "Emergency legal consultation", "Urgent intake for court deadlines, filing issues, and time-sensitive legal concerns."],
  [BriefcaseBusiness, "Corporate compliance", "Board, contract, and regulatory consultations with reusable appointment history."],
  [FileSearch, "Field assessment", "Property, claims, and site verification appointments assigned to qualified legal-field teams."],
  [UsersRound, "Civil mediation", "Structured follow-ups and lawyer-managed availability for recurring client matters."],
  [Landmark, "Court preparation", "Calendar coordination for filings, evidence review, and appearance preparation."],
  [Home, "Estate and property", "Client intake for title concerns, family estate matters, and property consultation."]
];

const serviceHighlights = ["Single intake path", "Urgent matters first", "Traceable follow-up"];

export default function Services() {
  const previewIntake = () => {
    toast.success("Service flow previewed. Use Request to continue.");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(178,183,170,0.16),_transparent_42%),linear-gradient(180deg,_#f8fafc_0%,_#f3f5f1_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(108,119,104,0.25),_transparent_38%),linear-gradient(180deg,_#05070b_0%,_#0b1016_100%)]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-jade-200 bg-white/80 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.24em] text-jade-800 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-jade-100">
            <Sparkles size={14} />
            Services
          </p>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white sm:text-5xl">Consultation workflows, organized for urgent and routine matters.</h1>
          <p className="mt-6 text-lg leading-8 text-ink-600 dark:text-ink-100">Each service type maps to a request path, showing how the firm routes high-priority cases, field review, and recurring client matters without splitting the experience into separate systems.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={previewIntake}
              className="focus-ring inline-flex items-center gap-2 rounded-lg bg-ink-900 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-jade-800 dark:bg-jade-400 dark:text-ink-950 dark:hover:bg-jade-100"
            >
              Preview intake flow
              <ArrowRight size={16} />
            </button>
            <Link
              to="/contact"
              className="focus-ring inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-5 py-3 text-sm font-extrabold text-ink-800 shadow-sm transition hover:border-jade-300 hover:text-jade-800 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-jade-100 dark:hover:text-jade-100"
            >
              Contact intake
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {serviceHighlights.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/75 px-3 py-2 text-xs font-semibold text-ink-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-ink-100">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {serviceGroups.map(([Icon, title, body]) => (
            <article key={title} className="rounded-2xl border border-ink-100 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-jade-50 text-jade-700 dark:bg-white/10 dark:text-jade-100">
                    <Icon size={24} />
                  </div>
                  <h2 className="text-lg font-extrabold text-ink-900 dark:text-white">{title}</h2>
                </div>
                <Link
                  to={`/appointments?type=${encodeURIComponent(title)}`}
                  onClick={() => toast.success(`${title} request path opened`)}
                  className="rounded-lg border border-jade-700 bg-jade-50 px-3 py-1.5 text-sm font-semibold text-jade-700 transition hover:bg-jade-100"
                >
                  Request
                </Link>
              </div>
              <p className="mt-4 text-sm leading-6 text-ink-500 dark:text-ink-100">{body}</p>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
