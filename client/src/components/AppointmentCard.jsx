import { format } from "date-fns";
import { CalendarClock, ShieldAlert } from "lucide-react";
import PriorityBadge from "./PriorityBadge";

export default function AppointmentCard({ appointment = {}, onOpenTimeline = null }) {
  const title = appointment.consultationType || appointment.type || appointment.subject || "Consultation request";
  const client = appointment.client?.name || appointment.client || "Client";
  const lawyer = appointment.lawyer?.user?.name || appointment.lawyer?.name || appointment.lawyer || "Unassigned";
  const status = appointment.status || "Unknown";
  const conflict = appointment.conflictStatus || appointment.conflict || "None";
  const start = appointment.scheduledStart || appointment.preferredStart || appointment.start;

  return (
    <article className="rounded-3xl border border-ink-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase text-ink-500 dark:text-ink-100">{appointment.id}</p>
          <h3 className="mt-1 text-base font-extrabold text-ink-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-100">{client} with {lawyer}</p>
        </div>
        <PriorityBadge priority={appointment.priority} />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-ink-600 dark:text-ink-100">
        <span className="flex items-center gap-2"><CalendarClock size={16} /> {start ? format(new Date(start), "MMM d, h:mm a") : 'TBD'}</span>
        <span className="flex items-center gap-2"><ShieldAlert size={16} /> {conflict}</span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-lg bg-ink-50 px-2.5 py-1 text-xs font-extrabold text-ink-600 dark:bg-white/10 dark:text-white">{status}</span>
        {onOpenTimeline ? (
          <button type="button" onClick={onOpenTimeline} className="focus-ring rounded-lg border border-ink-100 px-3 py-2 text-xs font-extrabold text-ink-700 transition hover:border-jade-400 hover:text-jade-700 dark:border-white/10 dark:text-white">
            View timeline
          </button>
        ) : (
          <span className="rounded-lg border border-ink-100 px-3 py-2 text-xs font-extrabold text-ink-400 dark:border-white/10 dark:text-ink-100">View timeline</span>
        )}
      </div>
    </article>
  );
}
