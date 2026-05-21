import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Download, RefreshCcw, Search } from "lucide-react";
import toast from "react-hot-toast";
import AppointmentCard from "../components/AppointmentCard";
import CalendarGrid from "../components/CalendarGrid";
import ChartCard from "../components/ChartCard";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import PriorityBadge from "../components/PriorityBadge";
import api, { unwrap } from "../lib/api";

const statusLabels = {
  PENDING: "Pending",
  RESCHEDULE_REQUESTED: "Reschedule requested",
  RESCHEDULED: "Rescheduled",
  SCHEDULED: "Scheduled",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
  CANCEL_REQUESTED: "Cancellation requested",
  CANCELLED: "Cancelled"
};

export default function AppointmentManagement() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let active = true;
    const loadAppointments = async () => {
      try {
        const response = await api.get("/appointments?limit=50");
        const data = unwrap(response);
        if (active) setAppointments(data.appointments || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load appointments");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadAppointments();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () => appointments.filter((appointment) => {
      const searchText = `${appointment.client?.name || appointment.client || ""} ${appointment.lawyer?.user?.name || appointment.lawyer?.name || appointment.lawyer || ""} ${appointment.consultationType || appointment.subject || appointment.type || ""}`.toLowerCase();
      const matchesSearch = searchText.includes(query.toLowerCase());
      const matchesStatus = !status || appointment.status === status || appointment.conflictStatus === status;
      return matchesSearch && matchesStatus;
    }),
    [appointments, query, status]
  );

  const summary = useMemo(() => appointments.reduce((acc, appointment) => {
    const statusKey = appointment.status || "PENDING";
    const conflictKey = appointment.conflictStatus || "PENDING_ASSIGNMENT";
    acc.total += 1;
    acc[statusKey] = (acc[statusKey] || 0) + 1;
    acc[conflictKey] = (acc[conflictKey] || 0) + 1;
    return acc;
  }, { total: 0 }), [appointments]);

  const calendarAppointments = filtered.slice(0, 30);

  const refreshQueue = async () => {
    setRefreshing(true);
    try {
      const response = await api.get("/appointments?limit=50");
      const data = unwrap(response);
      setAppointments(data.appointments || []);
      toast.success("Appointment queue refreshed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to refresh appointments");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">Appointment management</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink-900 dark:text-white">Requests, schedules, and conflict scans</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => toast.success("Export queued for download")} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm font-bold dark:border-white/10 dark:bg-white/5">
            <Download size={16} /> Export
          </button>
          <button type="button" onClick={refreshQueue} disabled={refreshing} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-ink-900 px-3 py-2 text-sm font-bold text-white disabled:opacity-70 dark:bg-jade-400 dark:text-ink-950">
            <RefreshCcw size={16} /> {refreshing ? "Refreshing..." : "Re-scan"}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search client, lawyer, or consultation type" className="focus-ring w-full rounded-lg border border-ink-100 py-3 pl-10 pr-3 text-sm font-medium dark:border-white/10 dark:bg-ink-950" />
          </label>
          <select value={status} onChange={(event) => { setMeta((current) => ({ ...current, page: 1 })); setStatus(event.target.value); }} className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-ink-100 px-4 py-3 text-sm font-bold dark:border-white/10 dark:bg-ink-950">
            <option value="">All status</option>
            <option value="PENDING">Submitted</option>
            <option value="RESCHEDULE_REQUESTED">Reschedule requested</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="CONFLICT">Conflict</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold text-ink-500 dark:text-ink-100">All appointments</p>
          <p className="mt-2 text-2xl font-extrabold text-ink-900 dark:text-white">{summary.total}</p>
        </div>
        <div className="rounded-lg border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold text-ink-500 dark:text-ink-100">Pending requests</p>
          <p className="mt-2 text-2xl font-extrabold text-ink-900 dark:text-white">{summary.PENDING || 0}</p>
        </div>
        <div className="rounded-lg border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold text-ink-500 dark:text-ink-100">Approved / scheduled</p>
          <p className="mt-2 text-2xl font-extrabold text-ink-900 dark:text-white">{(summary.APPROVED || 0) + (summary.SCHEDULED || 0)}</p>
        </div>
        <div className="rounded-lg border border-ink-100 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold text-ink-500 dark:text-ink-100">Conflict alerts</p>
          <p className="mt-2 text-2xl font-extrabold text-ink-900 dark:text-white">{summary.CONFLICT || 0}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard title="Calendar scheduling view" subtitle="Visual review for overlapping or congested appointment windows.">
          <CalendarGrid appointments={calendarAppointments} />
        </ChartCard>
        <ChartCard title="Appointment queue" subtitle="Click a request to inspect history, status, and conflict notes.">
          <div className="grid gap-4">
            {loading ? (
              <div className="grid gap-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-28 rounded-lg bg-ink-50 dark:bg-white/5" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((appointment) => (
                <button key={appointment.id} type="button" onClick={() => setSelected(appointment)} className="text-left">
                  <AppointmentCard appointment={appointment} />
                </button>
              ))
            ) : (
              <EmptyState title="No appointments found" message="Refine your search or refresh the queue to see the latest scheduling requests." />
            )}
          </div>
        </ChartCard>
      </div>

      <section className="overflow-hidden rounded-lg border border-ink-100 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-ink-50 text-xs font-extrabold uppercase text-ink-500 dark:bg-white/5 dark:text-ink-100">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Lawyer</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Conflict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-white/10">
              {(loading ? [...Array(5)] : filtered).map((appointment, index) => (
                appointment ? (
                  <tr key={appointment.id} className="hover:bg-ink-50 dark:hover:bg-white/5">
                    <td className="px-4 py-4 font-extrabold text-ink-900 dark:text-white">{appointment.id}</td>
                    <td className="px-4 py-4 text-ink-600 dark:text-ink-100">{appointment.client?.name || appointment.client || "—"}</td>
                    <td className="px-4 py-4 text-ink-600 dark:text-ink-100">{appointment.lawyer?.user?.name || appointment.lawyer?.name || "Unassigned"}</td>
                    <td className="px-4 py-4"><PriorityBadge priority={appointment.priority} /></td>
                    <td className="px-4 py-4 font-bold text-ink-600 dark:text-ink-100">{statusLabels[appointment.status] || appointment.status}</td>
                    <td className="px-4 py-4 text-ink-600 dark:text-ink-100">{appointment.conflictStatus || "Pending"}</td>
                  </tr>
                ) : (
                  <tr key={index} className="animate-pulse bg-ink-50 dark:bg-white/5">
                    <td className="px-4 py-4">&nbsp;</td>
                    <td className="px-4 py-4">&nbsp;</td>
                    <td className="px-4 py-4">&nbsp;</td>
                    <td className="px-4 py-4">&nbsp;</td>
                    <td className="px-4 py-4">&nbsp;</td>
                    <td className="px-4 py-4">&nbsp;</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3 text-xs font-semibold text-ink-500 dark:border-white/10 dark:text-ink-100">
          <span>Total appointments: {meta.totalItems || filtered.length}</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={meta.page <= 1} onClick={() => setMeta((current) => ({ ...current, page: current.page - 1 }))} className="rounded border border-ink-100 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10">Prev</button>
            <span>Page {meta.page} / {meta.totalPages || 1}</span>
            <button type="button" disabled={meta.page >= (meta.totalPages || 1)} onClick={() => setMeta((current) => ({ ...current, page: current.page + 1 }))} className="rounded border border-ink-100 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10">Next</button>
          </div>
        </div>
      </section>

      <Modal open={Boolean(selected)} title={selected?.id || "Appointment"} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="grid gap-4">
            <div className="rounded-lg bg-ink-50 p-4 dark:bg-white/5">
              <p className="font-extrabold text-ink-900 dark:text-white">{selected.consultationType || selected.subject || "Appointment details"}</p>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-100">{selected.client?.name || selected.client} with {selected.lawyer?.user?.name || selected.lawyer?.name || "Unassigned"}</p>
                <p className="mt-2 text-sm text-ink-500 dark:text-ink-100">Status: <span className="font-bold">{statusLabels[selected.status] || selected.status}</span></p>
            </div>
            <div className="grid gap-3">
              {(selected.history || []).map((item) => (
                <div key={`${item.action}-${item.createdAt}`} className="flex items-center justify-between rounded-lg border border-ink-100 p-3 dark:border-white/10">
                  <div>
                    <p className="font-bold text-ink-900 dark:text-white">{item.action.replace(/_/g, " ")}</p>
                    <p className="mt-1 text-sm text-ink-500 dark:text-ink-100">{item.note}</p>
                  </div>
                  <span className="text-xs font-extrabold text-ink-500 dark:text-ink-100">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}</span>
                </div>
              ))}
            </div>
              <div className="rounded-lg border border-ink-100 bg-ink-50 p-4 text-sm text-ink-600 dark:border-white/10 dark:bg-white/5 dark:text-ink-100">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="mt-0.5 text-brass-700" />
                  <div>
                    <p className="font-bold text-ink-900 dark:text-white">Policy note</p>
                    <p className="mt-1">Pending requests, approved schedules, and conflict alerts are reviewed from this single queue before staff confirms the final calendar slot.</p>
                  </div>
                </div>
              </div>
          </div>
        ) : (
          <EmptyState title="Select an appointment" message="Open a request from the queue to review details and history." />
        )}
      </Modal>
    </div>
  );
}
