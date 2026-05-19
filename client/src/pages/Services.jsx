import { BriefcaseBusiness, FileSearch, Gavel, Home, Landmark, UsersRound } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const serviceGroups = [
  [Gavel, "Emergency legal consultation", "High-priority intake for urgent filings, court deadlines, and time-sensitive legal questions."],
  [BriefcaseBusiness, "Corporate compliance", "Board, contract, and regulatory consultations with reusable appointment history."],
  [FileSearch, "Field assessment", "Property, claims, and site verification appointments assigned to qualified legal-field teams."],
  [UsersRound, "Civil mediation", "Structured follow-ups, document exchange, and lawyer-managed availability."],
  [Landmark, "Court preparation", "Calendar coordination for filings, evidence review, and appearance preparation."],
  [Home, "Estate and property", "Client intake for title concerns, family estate matters, and property consultation."]
];

export default function Services() {
  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">Services</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-ink-900 dark:text-white sm:text-5xl">LFC Legal Appointment System — consultancy workflows in one scheduling system.</h1>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {serviceGroups.map(([Icon, title, body]) => (
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
