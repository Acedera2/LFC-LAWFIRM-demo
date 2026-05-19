import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white dark:border-white/10 dark:bg-ink-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-5 max-w-md text-sm leading-6 text-ink-500 dark:text-ink-100">
            LFC Legal Appointment System — appointment intake, field consultancy scheduling, lawyer workload visibility, and conflict monitoring.
          </p>
          <div className="mt-6 grid gap-3 text-sm text-ink-600 dark:text-ink-100">
            <span className="flex items-center gap-3"><MapPin size={16} /> 28 Justice Avenue, Metro Manila</span>
            <span className="flex items-center gap-3"><Phone size={16} /> +63 2 8123 4567</span>
            <span className="flex items-center gap-3"><Mail size={16} /> concierge@lfcfirm.com</span>
          </div>
        </div>
        {[
          ["Platform", "Appointment intake", "Conflict monitoring", "Lawyer schedules"],
          ["Practice Areas", "Corporate law", "Field assessments", "Civil mediation"],
          ["Company", "About", "Lawyers", "Contact"]
        ].map((group) => (
          <div key={group[0]}>
            <h3 className="text-sm font-extrabold text-ink-900 dark:text-white">{group[0]}</h3>
            <ul className="mt-4 grid gap-3 text-sm text-ink-500 dark:text-ink-100">
              {group.slice(1).map((item) => (
                <li key={item}>
                  <a href="/contact" className="inline-flex items-center gap-2 transition hover:text-jade-600">
                    {item} <ArrowUpRight size={14} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ink-100 py-5 text-center text-xs font-semibold text-ink-500 dark:border-white/10 dark:text-ink-100">
        © {new Date().getFullYear()} LFC Legal Appointment System. Secure scheduling for modern legal teams.
      </div>
    </footer>
  );
}
