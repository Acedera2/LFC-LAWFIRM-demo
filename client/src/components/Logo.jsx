import { Link } from "react-router-dom";
import clsx from "clsx";

export default function Logo({ compact = false, className }) {
  return (
    <Link to="/" className={clsx("flex items-center gap-3", className)} aria-label="LFC Legal Appointment System home">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-ink-900 text-white shadow-soft dark:bg-white">
        <span className="relative text-sm font-extrabold text-brass-300 dark:text-ink-900">
          LF
          <span className="absolute -right-2 top-1 h-2 w-2 rounded-full bg-jade-400" />
        </span>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-sm font-extrabold text-ink-900 dark:text-white">LFC Legal</span>
          <span className="block text-xs font-semibold text-ink-500 dark:text-ink-100">Appointment System</span>
        </span>
      )}
    </Link>
  );
}
