import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Download, RefreshCcw, Search } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AppointmentCard from "../components/AppointmentCard";
import CalendarGrid from "../components/CalendarGrid";
import ChartCard from "../components/ChartCard";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import PriorityBadge from "../components/PriorityBadge";
import api, { unwrap } from "../lib/api";
import { subscribeRefresh, publishRefresh } from "../lib/refreshBus";
import { useAuth } from "../context/AuthContext";

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
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [lawyers, setLawyers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // determine whether current user has management roles (staff/admin)
  let canManage = false;
  try {
    const auth = useAuth();
    canManage = auth.hasRole('staff', 'admin');
  } catch {
    // fallback to localStorage session if AuthContext isn't available
    try {
      const raw = localStorage.getItem('lfc_user');
      const sess = raw ? JSON.parse(raw) : null;
      const slug = sess?.user?.role?.slug || sess?.user?.role;
      canManage = ['staff', 'admin'].includes(slug);
    } catch {
      canManage = false;
    }
  }

  const setSummaryFilter = (nextStatus) => {
    setMeta((current) => ({ ...current, page: 1 }));
    setStatus(nextStatus);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  useEffect(() => {
    let active = true;
    const loadAppointments = async () => {
      try {
        const response = await api.get("/appointments?limit=50");
        const data = unwrap(response);
        if (active) {
          setAppointments(data.appointments || []);
          if (data.meta) setMeta((current) => ({ ...current, ...data.meta }));
        }
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Please sign in to view appointments");
          navigate("/login", { state: { from: "/appointments" } });
          return;
        }
        toast.error(error.response?.data?.message || "Unable to load appointments");
      } finally {
        if (active) setLoading(false);
      }
    };

    // load lawyers for assignment
    const loadLawyers = async () => {
      try {
        const resp = await api.get('/lawyers');
        const data = unwrap(resp);
        setLawyers(data.lawyers || []);
      } catch {
        setLawyers([]);
      }
    };

    loadLawyers();

    const onAppointmentsUpdated = () => { loadAppointments(); };

    loadAppointments();
    const unsubscribe = subscribeRefresh("appointments:updated", onAppointmentsUpdated);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [navigate]);

  const filtered = useMemo(
    () => appointments.filter((appointment) => {
      const searchText = `${appointment.client?.name || appointment.client || ""} ${appointment.lawyer?.user?.name || appointment.lawyer?.name || appointment.lawyer || ""} ${appointment.consultationType || appointment.subject || appointment.type || ""}`.toLowerCase();
      const matchesSearch = searchText.includes(query.toLowerCase());
      const matchesStatus = !status
        || (status === "APPROVED_SCHEDULED"
          ? appointment.status === "SCHEDULED" || appointment.status === "APPROVED"
          : appointment.status === status || appointment.conflictStatus === status);
      return matchesSearch && matchesStatus;
    }),
    [appointments, query, status]
  );

  useEffect(() => {
    setMeta((current) => (current.page === 1 ? current : { ...current, page: 1 }));
  }, [query, status]);

  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((left, right) => {
      const leftDate = new Date(left.scheduledStart || left.preferredStart || left.createdAt || 0).getTime();
      const rightDate = new Date(right.scheduledStart || right.preferredStart || right.createdAt || 0).getTime();
      return rightDate - leftDate;
    });
  }, [filtered]);

  const pageSize = meta.limit || 10;
  const totalItems = sortedFiltered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(meta.page || 1, totalPages);
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedFiltered.slice(start, start + pageSize);
  }, [currentPage, pageSize, sortedFiltered]);

  const summary = useMemo(() => appointments.reduce((acc, appointment) => {
    const statusKey = appointment.status || "PENDING";
    const conflictKey = appointment.conflictStatus || "PENDING_ASSIGNMENT";
    acc.total += 1;
    acc[statusKey] = (acc[statusKey] || 0) + 1;
    acc[conflictKey] = (acc[conflictKey] || 0) + 1;
    return acc;
  }, { total: 0 }), [appointments]);

  const conflictClass = (status) => {
    if (!status) return 'rounded-lg bg-ink-50 px-2.5 py-1 text-xs font-extrabold text-ink-600 dark:bg-white/10 dark:text-white';
    switch (status) {
      case 'CONFLICT': return 'rounded-lg bg-signal-coral/12 px-2.5 py-1 text-xs font-extrabold text-signal-coral';
      case 'PENDING_ASSIGNMENT': return 'rounded-lg bg-ink-50 px-2.5 py-1 text-xs font-extrabold text-ink-600 dark:bg-white/10 dark:text-white';
      case 'CLEAR': return 'rounded-lg bg-ink-50 px-2.5 py-1 text-xs font-extrabold text-ink-600 dark:bg-white/10 dark:text-white';
      default: return 'rounded-lg bg-ink-50 px-2.5 py-1 text-xs font-extrabold text-ink-600 dark:bg-white/10 dark:text-white';
    }
  };

  const calendarAppointments = paginatedAppointments.slice(0, 30);

  const refreshQueue = async () => {
    setRefreshing(true);
    try {
      const response = await api.get("/appointments?limit=50");
      const data = unwrap(response);
      setAppointments(data.appointments || []);
      if (data.meta) setMeta((current) => ({ ...current, ...data.meta }));
      toast.success("Appointment queue refreshed");
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please sign in to refresh appointments");
        navigate("/login", { state: { from: "/appointments" } });
        return;
      }
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
          <button type="button" onClick={() => {
            const rows = [
              ["ID", "Client", "Lawyer", "Priority", "Status", "Conflict", "Scheduled Start"]
            ];
            sortedFiltered.forEach((appointment) => {
              rows.push([
                appointment.id,
                appointment.client?.name || appointment.client || "—",
                appointment.lawyer?.user?.name || appointment.lawyer?.name || appointment.lawyer || "Unassigned",
                appointment.priority || "—",
                statusLabels[appointment.status] || appointment.status || "—",
                appointment.conflictStatus || "Pending",
                appointment.scheduledStart || appointment.preferredStart || "—"
              ]);
            });
            const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `appointments-${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success("Appointment export downloaded");
          }} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm font-bold dark:border-white/10 dark:bg-white/5">
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
        <button type="button" onClick={() => setSummaryFilter('')} className={`text-left rounded-lg border p-4 ${!status ? 'border-jade-700 ring-2 ring-jade-100' : 'border-ink-100'} bg-white dark:bg-white/5`}>
          <p className="text-sm font-semibold text-ink-500 dark:text-ink-100">All appointments</p>
          <p className="mt-2 text-2xl font-extrabold text-ink-900 dark:text-white">{summary.total}</p>
        </button>

        <button type="button" onClick={() => setSummaryFilter('PENDING')} className={`text-left rounded-lg border p-4 ${status === 'PENDING' ? 'border-jade-700 ring-2 ring-jade-100' : 'border-ink-100'} bg-white dark:bg-white/5`}>
          <p className="text-sm font-semibold text-ink-500 dark:text-ink-100">Pending requests</p>
          <p className="mt-2 text-2xl font-extrabold text-ink-900 dark:text-white">{summary.PENDING || 0}</p>
        </button>

        <button type="button" onClick={() => setSummaryFilter('APPROVED_SCHEDULED')} className={`text-left rounded-lg border p-4 ${(status === 'APPROVED_SCHEDULED') ? 'border-jade-700 ring-2 ring-jade-100' : 'border-ink-100'} bg-white dark:bg-white/5`}>
          <p className="text-sm font-semibold text-ink-500 dark:text-ink-100">Approved / scheduled</p>
          <p className="mt-2 text-2xl font-extrabold text-ink-900 dark:text-white">{(summary.APPROVED || 0) + (summary.SCHEDULED || 0)}</p>
        </button>

        <button type="button" onClick={() => setSummaryFilter('CONFLICT')} className={`text-left rounded-lg border p-4 ${status === 'CONFLICT' ? 'border-signal-coral ring-2 ring-signal-coral/10' : 'border-ink-100'} bg-white dark:bg-white/5`}>
          <p className="text-sm font-semibold text-ink-500 dark:text-ink-100">Conflict alerts</p>
          <p className="mt-2 text-2xl font-extrabold text-ink-900 dark:text-white">{summary.CONFLICT || 0}</p>
        </button>
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
            ) : paginatedAppointments.length > 0 ? (
              paginatedAppointments.map((appointment) => (
                canManage ? (
                  <button key={appointment.id} type="button" onClick={() => setSelected(appointment)} className="text-left">
                    <AppointmentCard appointment={appointment} />
                  </button>
                ) : (
                  <div key={appointment.id} className="text-left">
                    <AppointmentCard appointment={appointment} />
                  </div>
                )
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
                  <tr key={appointment.id} className={`hover:bg-ink-50 dark:hover:bg-white/5 ${!canManage ? 'opacity-90' : ''}`}>
                    <td className="px-4 py-4 font-extrabold text-ink-900 dark:text-white">{appointment.id}</td>
                    <td className="px-4 py-4 text-ink-600 dark:text-ink-100">{appointment.client?.name || appointment.client || "—"}</td>
                    <td className="px-4 py-4 text-ink-600 dark:text-ink-100">{appointment.lawyer?.user?.name || appointment.lawyer?.name || "Unassigned"}</td>
                    <td className="px-4 py-4"><PriorityBadge priority={appointment.priority} /></td>
                    <td className="px-4 py-4 font-bold text-ink-600 dark:text-ink-100">{statusLabels[appointment.status] || appointment.status}</td>
                    <td className="px-4 py-4 text-ink-600 dark:text-ink-100"><span className={conflictClass(appointment.conflictStatus)}>{appointment.conflictStatus || "Pending"}</span></td>
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
          <span>Total appointments: {totalItems}</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={currentPage <= 1} onClick={() => setMeta((current) => ({ ...current, page: Math.max(1, current.page - 1) }))} className="rounded border border-ink-100 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10">Prev</button>
            <span>Page {currentPage} / {totalPages}</span>
            <button type="button" disabled={currentPage >= totalPages} onClick={() => setMeta((current) => ({ ...current, page: Math.min(totalPages, current.page + 1) }))} className="rounded border border-ink-100 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10">Next</button>
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
            {canManage ? (
              <div className="flex gap-2">
                <button type="button" onClick={async () => {
                  try {
                    await api.patch(`/appointments/${selected.id}`, { status: 'APPROVED' });
                    toast.success('Appointment approved — notifications sent');
                    publishRefresh('appointments:updated');
                    setSelected((s) => ({ ...s, status: 'APPROVED' }));
                  } catch { toast.error('Could not approve appointment'); }
                }} className="rounded bg-jade-700 px-3 py-2 text-sm font-bold text-white">Approve</button>

                <button type="button" onClick={async () => {
                    try {
                    // quick schedule: set scheduledStart to preferredStart if available
                    const scheduledStart = selected.preferredStart || new Date().toISOString();
                    const scheduledEnd = selected.preferredEnd || new Date(Date.parse(scheduledStart) + 30*60*1000).toISOString();
                    const lawyerId = selected.lawyerId || selected.lawyer?.id || null;
                    // perform conflict check before scheduling
                    try {
                      const check = await api.post('/appointments/conflict-check', { lawyerId, preferredStart: scheduledStart, preferredEnd: scheduledEnd });
                      const result = unwrap(check);
                      if (result.conflict) {
                        const cont = window.confirm('A conflict was detected for this time. Schedule anyway?');
                        if (!cont) return;
                      }
                    } catch (err) {
                      // if conflict-check fails, allow operator to proceed but warn
                      console.warn('Conflict check failed, proceeding to schedule', err);
                    }

                    await api.patch(`/appointments/${selected.id}`, { status: 'SCHEDULED', scheduledStart, scheduledEnd });
                    toast.success('Appointment scheduled — participants notified');
                    publishRefresh('appointments:updated');
                    setSelected((s) => ({ ...s, status: 'SCHEDULED', scheduledStart, scheduledEnd }));
                  } catch { toast.error('Could not schedule appointment'); }
                }} className="rounded border border-ink-100 px-3 py-2 text-sm font-bold">Schedule</button>

                <button type="button" onClick={async () => {
                  try {
                    await api.patch(`/appointments/${selected.id}`, { status: 'REJECTED' });
                    toast.success('Appointment rejected — staff updated');
                    publishRefresh('appointments:updated');
                    setSelected((s) => ({ ...s, status: 'REJECTED' }));
                  } catch { toast.error('Could not reject appointment'); }
                }} className="rounded bg-brass-700 px-3 py-2 text-sm font-bold text-white">Reject</button>
              </div>
            ) : (
              <div className="rounded-lg border border-ink-100 bg-ink-50 p-3 text-sm text-ink-600">You do not have permission to perform scheduling actions. Contact staff for assistance.</div>
            )}

            <div className="mt-3 grid gap-2">
              <label className="grid gap-2">
                <span className="text-sm font-bold">Assign lawyer</span>
                <select value={selected?.lawyerId || ''} onChange={async (e) => {
                  const lawyerId = e.target.value || null;
                  if (!canManage) { toast.error('You are not authorized to assign lawyers'); return; }
                  try {
                    const lawyer = lawyers.find(l => l.id === lawyerId);
                    await api.patch(`/appointments/${selected.id}`, { lawyerId, historyItem: { action: 'ASSIGNED', note: lawyer ? `Assigned to ${lawyer.user?.name || lawyerId}` : 'Unassigned' } });
                    toast.success('Lawyer assignment updated');
                    publishRefresh('appointments:updated');
                    setSelected(s => ({ ...s, lawyer: lawyer ? { ...lawyer, user: lawyer.user } : null, lawyerId }));
                  } catch { toast.error('Could not assign lawyer'); }
                }} className="rounded-lg border border-ink-100 px-3 py-2">
                  <option value="">Let staff assign</option>
                  {lawyers.map(l => <option key={l.id} value={l.id}>{l.user?.name || l.name}</option>)}
                </select>
              </label>

              <div className="flex gap-2">
                {selected?.conflictStatus === 'CONFLICT' && (
                  <div className="rounded-lg border border-signal-coral/30 bg-signal-coral/10 p-3 text-sm text-signal-coral">
                    <strong>Conflict detected:</strong> This appointment overlaps an existing booking for the assigned lawyer. Proceed with caution.
                  </div>
                )}
                <button type="button" onClick={async () => {
                  if (!canManage) { toast.error('You are not authorized to request a reschedule'); return; }
                  const note = window.prompt('Enter reschedule note or preferred date/time (optional):', 'Client requested different date');
                  try {
                    await api.patch(`/appointments/${selected.id}`, { status: 'RESCHEDULE_REQUESTED', historyItem: { action: 'RESCHEDULE_REQUESTED', note: note || 'Reschedule requested' } });
                    toast.success('Reschedule requested — client and staff notified');
                    publishRefresh('appointments:updated');
                    setSelected(s => ({ ...s, status: 'RESCHEDULE_REQUESTED' }));
                  } catch { toast.error('Could not request reschedule'); }
                }} className="rounded border border-ink-100 px-3 py-2 text-sm font-bold">Request reschedule</button>

                <button type="button" onClick={async () => {
                  if (!canManage) { toast.error('You are not authorized to delete appointments'); return; }
                  if (!selected) return;
                  const confirmed = window.confirm('Delete this appointment? This will remove it from the demo store.');
                  if (!confirmed) return;
                  try {
                    await api.delete(`/appointments/${selected.id}`);
                    toast.success('Appointment deleted from demo store');
                    publishRefresh('appointments:updated');
                    setSelected(null);
                  } catch { toast.error('Could not delete appointment'); }
                }} className="rounded bg-red-600 px-3 py-2 text-sm font-bold text-white">Delete</button>
              </div>
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
