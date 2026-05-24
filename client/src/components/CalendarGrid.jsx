const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = ["08:00", "10:00", "12:00", "14:00", "16:00"];

const statusTone = {
  PENDING: "bg-brass-100 text-brass-700",
  RESCHEDULE_REQUESTED: "bg-brass-100 text-brass-700",
  APPROVED: "bg-jade-100 text-jade-800",
  SCHEDULED: "bg-jade-100 text-jade-800",
  CANCEL_REQUESTED: "bg-signal-coral/12 text-signal-coral",
  CANCELLED: "bg-ink-100 text-ink-500 dark:bg-white/10 dark:text-ink-100",
  COMPLETED: "bg-blue-100 text-blue-700",
  CONFLICT: "bg-signal-coral/12 text-signal-coral",
  WARNING: "bg-brass-100 text-brass-700"
};

function getSlotKey(date, hour) {
  const slotDate = new Date(date);
  const [hoursPart] = hour.split(":");
  slotDate.setHours(Number(hoursPart), 0, 0, 0);
  return slotDate.toISOString().slice(0, 13);
}

function normalizeAppointmentDate(appointment) {
  return new Date(appointment.scheduledStart || appointment.preferredStart || appointment.startAt || appointment.start || appointment.createdAt);
}

export default function CalendarGrid({ appointments = [] }) {
  const slotMap = appointments.reduce((acc, appointment) => {
    const date = normalizeAppointmentDate(appointment);
    if (Number.isNaN(date.getTime())) return acc;
    const key = getSlotKey(date, `${String(date.getHours()).padStart(2, "0")}:00`);
    acc[key] ||= [];
    acc[key].push({ ...appointment, date });
    return acc;
  }, {});

  return (
    <div className="grid gap-4">
      <div className="overflow-x-auto">
      <div className="min-w-[840px] rounded-lg border border-ink-100 dark:border-white/10">
        <div className="grid grid-cols-[90px_repeat(7,1fr)] border-b border-ink-100 bg-ink-50 text-xs font-extrabold uppercase text-ink-500 dark:border-white/10 dark:bg-white/5 dark:text-ink-100">
          <div className="p-3">Time</div>
          {days.map((day) => <div key={day} className="p-3">{day}</div>)}
        </div>
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-[90px_repeat(7,1fr)] border-b border-ink-100 last:border-b-0 dark:border-white/10">
            <div className="p-3 text-xs font-bold text-ink-500 dark:text-ink-100">{hour}</div>
            {days.map((day, index) => {
              const cellDate = new Date();
              cellDate.setDate(cellDate.getDate() - ((cellDate.getDay() + 6) % 7) + index);
              const key = getSlotKey(cellDate, hour);
              const slotItems = slotMap[key] || [];
              const primary = slotItems[0];
              return (
                <div key={`${day}-${hour}`} className="calendar-slot border-l border-ink-100 p-2 dark:border-white/10">
                  <div className={`h-full rounded-lg px-2 py-2 text-xs font-bold ${primary ? (statusTone[primary.conflictStatus || primary.status] || "bg-ink-50 text-ink-500 dark:bg-white/5 dark:text-ink-100") : "bg-ink-50 text-ink-400 dark:bg-white/5 dark:text-ink-100"}`}>
                    {slotItems.length > 0 ? (
                      <div className="grid gap-1">
                        <span>{slotItems.length} appointment{slotItems.length > 1 ? "s" : ""}</span>
                        {slotItems.slice(0, 2).map((item) => (
                          <span key={item.id} className="line-clamp-2 font-semibold opacity-90">
                            {item.client?.name || item.clientName || item.client || "Client"} · {item.conflictStatus || item.status || "Pending"}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "Open"
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
