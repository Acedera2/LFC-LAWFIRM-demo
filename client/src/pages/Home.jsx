// Removed animations for prototype simplicity
import { ArrowRight, CalendarCheck, CheckCircle2, FileText, Scale, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { lawyers } from "../data/mockData";

const services = [
  "Emergency legal consultation",
  "Court deadline preparation",
  "Field verification and claims review",
  "Corporate compliance appointments",
  "Family and civil mediation",
  "Property and estate advisory"
];

const testimonials = [
  {
    quote: "The scheduling team identified an availability conflict before it became a missed filing window. The experience felt calm and exact.",
    name: "Mina Santos",
    role: "Corporate client"
  },
  {
    quote: "Our counsel, staff, and field consultants finally work from the same calendar. Reports are no longer a Friday scramble.",
    name: "Rafael Dizon",
    role: "Operations director"
  },
  {
    quote: "The intake process is secure, guided, and respectful. I could track every step without repeated calls or manual follow-ups.",
    name: "Janine Cruz",
    role: "Client"
  }
];

const faqs = [
  ["How does priority classification work?", "Emergency matters, court deadlines, and urgent filings are classified as Urgent. Follow-ups and active processing become Moderate, while general consultations stay Regular."],
  ["Do clients need to upload documents to book?", "No. The appointment workflow is inquiry-first and conflict-aware, so booking can proceed without a file upload step."],
  ["Does the system prevent double booking?", "The API scans scheduled start and end times, lawyer availability windows, daily capacity, and historical congestion patterns before confirmation."],
  ["Can the platform be deployed?", "Yes. The client is ready for Vercel, the API for Render or Railway, and the database for PlanetScale or any MySQL-compatible host."]
];

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-extrabold text-ink-900 dark:text-white sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-7 text-ink-500 dark:text-ink-100">{subtitle}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-ink-50 text-ink-900 dark:bg-ink-950 dark:text-white">
      <Navbar />
      <main>
        <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-hero-room bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
          <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/12 px-3 py-2 text-sm font-bold text-white backdrop-blur-xl">
                <Sparkles size={16} /> Enterprise legal scheduling SaaS
              </span>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight text-white sm:text-6xl lg:text-7xl">
                LFC Legal Appointment System
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white">
                A secure appointment, lawyer availability, conflict monitoring, and analytics platform for modern legal operations.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-jade-400 px-5 py-3 text-sm font-extrabold text-ink-950 transition hover:bg-jade-100">
                  Start client inquiry <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-extrabold text-white backdrop-blur-xl transition hover:bg-white/18">
                  Staff portal
                </Link>
              </div>
            </div>
            <div className="mt-12 grid max-w-4xl gap-3 sm:grid-cols-3">
              {[
                ["98%", "appointment completion readiness"],
                ["24/7", "client inquiry intake"],
                ["Centralized", "one calendar across every role"]
              ].map(([value, label]) => (
                <div key={label} className="glass-panel rounded-lg p-4 text-white">
                  <p className="text-2xl font-extrabold">{value}</p>
                  <p className="mt-1 text-sm text-white/78">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 dark:bg-ink-950" id="about">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">About the firm</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-ink-900 dark:text-white sm:text-4xl">Designed for legal work that cannot afford scheduling drift.</h2>
            </div>
            <div className="grid gap-5 text-base leading-7 text-ink-600 dark:text-ink-100">
              <p>
                The platform combines client intake, lawyer availability, field consultation logistics, staff verification, and executive reporting in one secure workflow.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  [Scale, "Legal-grade workflow"],
                  [ShieldCheck, "Secure by default"],
                  [CalendarCheck, "Conflict-aware calendar"]
                ].map(([Icon, label]) => (
                  <div key={label} className="rounded-lg border border-ink-100 p-4 dark:border-white/10">
                    <Icon className="text-jade-700 dark:text-jade-100" size={22} />
                    <p className="mt-3 text-sm font-extrabold text-ink-900 dark:text-white">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 dark:bg-ink-900/40" id="services">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader eyebrow="Services offered" title="From intake to resolution, every consultation is traceable." subtitle="Handle priority matters, field review, lawyer assignment, and client notifications without separate spreadsheets." />
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div key={service} className="rounded-lg border border-ink-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-white/10 dark:bg-white/5">
                  <CheckCircle2 className="text-jade-600" size={22} />
                  <h3 className="mt-4 text-base font-extrabold text-ink-900 dark:text-white">{service}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-500 dark:text-ink-100">Rules-based scheduling, priority tagging, and audit-backed activity history keep every request accountable.</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 dark:bg-ink-950" id="lawyers">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader eyebrow="Lawyer profiles" title="Specialists with live workload visibility." subtitle="Clients can request the right consultation type while staff and administrators monitor daily capacity." />
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {lawyers.map((lawyer) => (
                <article key={lawyer.id} className="rounded-lg border border-ink-100 bg-ink-50 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="grid h-16 w-16 place-items-center rounded-lg bg-ink-900 text-xl font-extrabold text-brass-300 dark:bg-white dark:text-ink-900">{lawyer.initials}</div>
                  <h3 className="mt-5 text-lg font-extrabold text-ink-900 dark:text-white">{lawyer.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-jade-700 dark:text-jade-100">{lawyer.specialty}</p>
                  <p className="mt-4 text-sm text-ink-500 dark:text-ink-100">{lawyer.availability}</p>
                  <div className="mt-5 h-2 rounded-full bg-ink-100 dark:bg-white/10">
                    <div className="h-2 rounded-full bg-jade-400" style={{ width: `${lawyer.workload}%` }} />
                  </div>
                  <p className="mt-2 text-xs font-bold text-ink-500 dark:text-ink-100">{lawyer.workload}% assigned workload</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ink-950 py-20 text-white" id="contact">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
            <div>
              <p className="text-sm font-extrabold uppercase text-jade-100">Contact</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Submit an inquiry and let staff route the request.</h2>
              <p className="mt-4 max-w-2xl text-white/75">Clients can ask about consultation availability, priority needs, and preferred lawyers without starting from a phone log or spreadsheet.</p>
              <div className="mt-8 grid gap-3 text-sm text-white/80">
                <span>concierge@lfcfirm.com</span>
                <span>+63 45 123 4567</span>
                <span>Occidental Mindoro Provincial Capitol</span>
              </div>
            </div>
            <form className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-xl" onSubmit={(event) => { event.preventDefault(); event.currentTarget.reset(); }}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-white">
                  Full name
                  <input required className="focus-ring rounded-lg border border-white/10 bg-ink-950 px-3 py-3 font-medium text-white" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-white">
                  Email
                  <input required type="email" className="focus-ring rounded-lg border border-white/10 bg-ink-950 px-3 py-3 font-medium text-white" />
                </label>
              </div>
              <label className="mt-4 grid gap-2 text-sm font-bold text-white">
                Inquiry
                <textarea required rows="6" className="focus-ring rounded-lg border border-white/10 bg-ink-950 px-3 py-3 font-medium text-white" />
              </label>
              <button className="focus-ring mt-5 rounded-lg bg-jade-400 px-5 py-3 text-sm font-extrabold text-ink-950 transition hover:bg-jade-100" type="submit">
                Send inquiry
              </button>
            </form>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg bg-ink-900 p-8 text-white shadow-soft md:p-12">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <p className="text-sm font-extrabold uppercase text-jade-100">Appointment inquiry CTA</p>
                  <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Start with the right priority, lawyer, and schedule window.</h2>
                  <p className="mt-4 max-w-2xl text-white/75">Clients can create secure accounts, request preferred times, and follow appointment status in one place.</p>
                </div>
                <Link to="/register" className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-brass-300 px-5 py-3 text-sm font-extrabold text-ink-950 transition hover:bg-brass-100">
                  Open client intake <FileText size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 dark:bg-ink-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader eyebrow="Testimonials" title="Built for firms that move quickly and document carefully." />
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <figure key={testimonial.name} className="rounded-lg border border-ink-100 p-6 dark:border-white/10">
                  <blockquote className="text-sm leading-6 text-ink-600 dark:text-ink-100">&quot;{testimonial.quote}&quot;</blockquote>
                  <figcaption className="mt-5 text-sm font-extrabold text-ink-900 dark:text-white">{testimonial.name}</figcaption>
                  <p className="text-xs font-semibold text-ink-500 dark:text-ink-100">{testimonial.role}</p>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">FAQ</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-ink-900 dark:text-white">Operational answers before rollout.</h2>
            </div>
            <div className="grid gap-3">
              {faqs.map(([question, answer]) => (
                <details key={question} className="rounded-lg border border-ink-100 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                  <summary className="cursor-pointer text-sm font-extrabold text-ink-900 dark:text-white">{question}</summary>
                  <p className="mt-3 text-sm leading-6 text-ink-500 dark:text-ink-100">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
