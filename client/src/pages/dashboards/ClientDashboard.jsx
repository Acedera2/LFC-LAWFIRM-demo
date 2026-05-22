import { useEffect, useMemo, useState } from "react";
import {
  CalendarPlus,
  Clock3,
  History,
  SearchCheck,
  ShieldAlert,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";

import AppointmentCard from "../../components/AppointmentCard";
import DashboardLayout from "../../components/DashboardLayout";
import EmptyState from "../../components/EmptyState";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import Modal from "../../components/Modal";
import PriorityBadge from "../../components/PriorityBadge";
import StatCard from "../../components/StatCard";
import { mapAppointment } from "../../features/appointments/mappers";
import api, { unwrap } from "../../lib/api";
import { useNavigate } from "react-router-dom";

const consultationTypes = [
  { label: "Emergency consultation", priority: "URGENT" },
  { label: "Court deadline preparation", priority: "URGENT" },
  { label: "Urgent legal filing", priority: "URGENT" },
  { label: "Ongoing legal processing", priority: "MODERATE" },
  { label: "Scheduled follow-up", priority: "MODERATE" },
  { label: "General consultation", priority: "REGULAR" },
  { label: "Non-urgent concern", priority: "REGULAR" }
];

const priorityLabels = {
  URGENT: "Urgent",
  HIGH: "Urgent",
  MODERATE: "Moderate",
  MEDIUM: "Moderate",
  REGULAR: "Regular"
};

const fallbackLawyers = [
  { id: "fallback-1", name: "Atty. Elena Rivera", specialty: "Corporate Law" },
  { id: "fallback-2", name: "Atty. Marco Santos", specialty: "Civil Litigation" },
  { id: "fallback-3", name: "Atty. Nina Valdez", specialty: "Family Law" }
];

const fallbackAppointments = [
  {
    id: "appt-1",
    title: "General Legal Consultation",
    status: "Pending",
    priority: "Regular",
    scheduledAt: new Date().toISOString(),
    lawyer: { name: "Atty. Elena Rivera" }
  }
];

function suggestedPriorityFor(type) {
  return consultationTypes.find((item) => item.label === type)?.priority || "REGULAR";
}

export default function ClientDashboard() {
  const [lawyers, setLawyers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [scan, setScan] = useState(null);
  const [cancellationTarget, setCancellationTarget] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [form, setForm] = useState({
    consultationType: "General consultation",
    priority: "REGULAR",
    lawyerId: "",
    locationMode: "IN_PERSON",
    subject: "",
    description: "",
    preferredDate: ""
  });

  const selectedPriority = useMemo(() => suggestedPriorityFor(form.consultationType), [form.consultationType]);

  useEffect(() => {
    let active = true;

    Promise.all([api.get("/lawyers"), api.get("/appointments?limit=5")])
      .then(([lawyersResponse, appointmentsResponse]) => {
        if (!active) return;
        setLawyers(unwrap(lawyersResponse).lawyers || lawyersResponse.data?.data || []);
        setAppointments((unwrap(appointmentsResponse).appointments || []).map(mapAppointment).filter(Boolean));
      })
      .catch(() => {
        if (!active) return;
        setLawyers(fallbackLawyers);
        setAppointments(fallbackAppointments);
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

  useEffect(() => { setForm((current) => ({ ...current, priority: selectedPriority })); setScan(null); }, [selectedPriority]);

  const lawyerOptions = lawyers.length > 0 ? lawyers.map((lawyer) => ({ id: lawyer.id, name: lawyer.user?.name || lawyer.name, specialty: lawyer.specialization || lawyer.specialty })) : fallbackLawyers;
  const selectedLawyer = lawyerOptions.find((lawyer) => lawyer.id === form.lawyerId);

  const requestsOpen = appointments.filter((item) => item.status !== "COMPLETED").length;
  const nextConsult = appointments.find((item) => item.scheduledStart || item.preferredStart);
  const nextLabel = nextConsult ? new Date(nextConsult.scheduledStart || nextConsult.preferredStart).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "No scheduled consult";

  const navigate = useNavigate();

  const checkAvailability = async () => {
    if (!form.lawyerId) { toast.error("Select a lawyer first"); return; }
    if (!form.preferredDate) { toast.error("Select a date to check availability"); return; }
    setChecking(true);
    try {
      // build day range for the selected date (local start to end of day)
      const start = new Date(form.preferredDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(form.preferredDate);
      end.setHours(23, 59, 59, 999);
      const response = await api.post("/appointments/conflict-check", { lawyerId: form.lawyerId, consultationType: form.consultationType, preferredStart: start.toISOString(), preferredEnd: end.toISOString() });
      const data = unwrap(response);
      // the demo API returns { conflict, available } — adapt into a scan-like object
      setScan({ status: data.available ? "CLEAR" : "CONFLICT", reason: data.conflict ? "Conflicting appointment exists" : null, suggestions: [] });
      toast.success(data.available ? "Lawyer appears available on selected date" : "Lawyer has conflicts on selected date");
    } catch (error) { toast.error(error.response?.data?.message || "Could not check availability"); } finally { setChecking(false); }
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      // translate preferredDate into a day range for backend
      const payload = { ...form, lawyerId: form.lawyerId || undefined };
      if (form.preferredDate) {
        const start = new Date(form.preferredDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(form.preferredDate);
        end.setHours(23, 59, 59, 999);
        payload.preferredStart = start.toISOString();
        payload.preferredEnd = end.toISOString();
      }
      const response = await api.post("/appointments", payload);
      const appointment = unwrap(response).appointment;
      const normalized = mapAppointment(appointment);
      toast.success("Appointment inquiry submitted");
      setForm({ consultationType: "General consultation", priority: "REGULAR", lawyerId: "", locationMode: "IN_PERSON", subject: "", description: "", preferredDate: "" });
      setScan(null);
      if (normalized) setAppointments((current) => [normalized, ...current].slice(0, 5));
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        toast.error("Please sign in to submit an appointment");
        navigate('/login', { state: { from: '/client' } });
        return;
      }
      toast.error(error.response?.data?.message || "Could not submit appointment");
    }
  };

  const requestCancellation = async (event) => {
    event.preventDefault();
    if (!cancellationTarget) return;
    try {
      await api.delete(`/appointments/${cancellationTarget.id}`, {
        data: { reason: cancellationReason || "Client requested cancellation" }
      });
      toast.success("Cancellation request sent to staff");
      setAppointments((current) => current.map((item) => item.id === cancellationTarget.id ? { ...item, status: "CANCELLED", displayStatus: "Cancelled" } : item));
      setCancellationTarget(null);
      setCancellationReason("");
    } catch (error) {
      if (error?.response?.status === 401) {
        toast.error("Please sign in to request a cancellation");
        navigate('/login', { state: { from: '/client' } });
        return;
      }
      toast.error(error.response?.data?.message || "Could not request cancellation");
    }
  };

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={CalendarPlus} label="Open requests" value={loading ? "..." : `${requestsOpen}`} trend="1 needs verification" />
          <StatCard icon={Clock3} label="Next consult" value={loading ? "..." : nextLabel.split(",")[0]} trend={loading ? "Loading..." : nextLabel.split(",")[1]?.trim() || nextLabel} tone="brass" />
          <StatCard icon={History} label="Priority" value={priorityLabels[selectedPriority] || selectedPriority} trend="Classified from consultation type" tone="jade" />
          <StatCard icon={ShieldAlert} label="Lawyer" value={selectedLawyer?.name || "Select one"} trend={selectedLawyer?.specialty || "Availability reviewed after date selection"} tone="blue" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-ink-900 dark:text-white">Submit appointment inquiry</h2>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-100">Select the appointment date first, then review available lawyers and submit the request.</p>
              </div>
              <PriorityBadge priority={priorityLabels[form.priority]} />
            </div>

            <form onSubmit={submit} className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold">Appointment date</span>
                <input type="date" value={form.preferredDate} onChange={(event) => setForm((current) => ({ ...current, preferredDate: event.target.value }))} className="rounded-2xl border border-ink-100 px-4 py-3 dark:border-white/10 dark:bg-ink-950" />
                <p className="text-xs text-ink-500 mt-1">Select a date and click &quot;Check availability&quot; to see if your preferred lawyer is free.</p>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold">Consultation type</span>
                <select value={form.consultationType} onChange={(event) => setForm((current) => ({ ...current, consultationType: event.target.value }))} className="rounded-2xl border border-ink-100 px-4 py-3 dark:border-white/10 dark:bg-ink-950">
                  {consultationTypes.map((type) => <option key={type.label} value={type.label}>{type.label}</option>)}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold">Preferred lawyer</span>
                <select value={form.lawyerId} onChange={(event) => setForm((current) => ({ ...current, lawyerId: event.target.value }))} className="rounded-2xl border border-ink-100 px-4 py-3 dark:border-white/10 dark:bg-ink-950">
                  <option value="">Let staff assign</option>
                  {lawyerOptions.map((lawyer) => <option key={lawyer.id} value={lawyer.id}>{lawyer.name}</option>)}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold">Subject</span>
                <input value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} className="rounded-2xl border border-ink-100 px-4 py-3 dark:border-white/10 dark:bg-ink-950" />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold">Description</span>
                <textarea rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="rounded-2xl border border-ink-100 px-4 py-3 dark:border-white/10 dark:bg-ink-950" />
              </label>

              <div className="rounded-2xl border border-ink-100 bg-ink-50 p-4 text-sm text-ink-600 dark:border-white/10 dark:bg-white/5 dark:text-ink-100">
                <p className="font-bold text-ink-900 dark:text-white">Workflow note</p>
                <p className="mt-1">The system classifies priority automatically, checks schedule conflicts, and routes the request for staff review before confirmation.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={checkAvailability} disabled={checking} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-jade-700 px-4 py-3 text-sm font-bold text-white"><SearchCheck size={16} />{checking ? "Checking..." : "Check availability"}</button>
                <button type="submit" className="rounded-2xl bg-ink-900 px-5 py-3 text-sm font-bold text-white dark:bg-jade-400 dark:text-ink-950">Submit inquiry</button>
              </div>
            </form>

            {scan && (<div className="mt-6 rounded-2xl border border-jade-200 bg-jade-50 p-4 text-sm text-ink-900 dark:border-white/10 dark:bg-white/5 dark:text-white"><p className="font-extrabold uppercase text-jade-700 dark:text-jade-100">Latest conflict scan</p><p className="mt-2">Status: <span className="font-bold">{scan.status}</span></p>{scan.reason && <p className="mt-1 text-ink-600 dark:text-ink-100">{scan.reason}</p>}{scan.suggestions?.length ? (<ul className="mt-3 grid gap-1 text-ink-600 dark:text-ink-100">{scan.suggestions.map((s) => <li key={s}>• {s}</li>)}</ul>) : null}</div>)}
          </section>

          <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-jade-700 dark:text-jade-100" size={22} />
              <h2 className="text-lg font-extrabold text-ink-900 dark:text-white">Latest appointments</h2>
            </div>

            <div className="mt-5 grid gap-4">
              {loading ? <LoadingSkeleton rows={3} /> : appointments.length ? appointments.map((appointment) => (
                <div key={appointment.id} className="grid gap-3">
                  <AppointmentCard appointment={appointment} />
                  {appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" ? (
                    <button
                      type="button"
                      onClick={() => { setCancellationTarget(appointment); setCancellationReason(""); }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-signal-coral/20 px-4 py-3 text-sm font-bold text-signal-coral transition hover:bg-signal-coral/10"
                    >
                      <Trash2 size={16} /> Request for Cancellation
                    </button>
                  ) : null}
                </div>
              )) : <EmptyState title="No appointments yet" message="Your consultation requests and schedules will appear here." />}
            </div>
          </section>
        </div>
      </div>

      <Modal open={Boolean(cancellationTarget)} title="Request for Cancellation" onClose={() => setCancellationTarget(null)}>
        <form onSubmit={requestCancellation} className="grid gap-4">
          <div className="rounded-lg bg-ink-50 p-4 text-sm dark:bg-white/5">
            <p className="font-extrabold text-ink-900 dark:text-white">{cancellationTarget?.consultationType || cancellationTarget?.title || "Selected appointment"}</p>
            <p className="mt-1 text-ink-500 dark:text-ink-100">This request will be sent to staff for review and schedule adjustment.</p>
          </div>
          <label className="grid gap-2">
            <span className="text-sm font-bold">Reason</span>
            <textarea
              rows={4}
              value={cancellationReason}
              onChange={(event) => setCancellationReason(event.target.value)}
              className="rounded-2xl border border-ink-100 px-4 py-3 dark:border-white/10 dark:bg-ink-950"
              placeholder="Add a short reason for the cancellation request"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setCancellationTarget(null)} className="rounded-2xl border border-ink-100 px-4 py-3 text-sm font-bold dark:border-white/10">Close</button>
            <button type="submit" className="rounded-2xl bg-signal-coral px-4 py-3 text-sm font-bold text-white">Submit request</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
