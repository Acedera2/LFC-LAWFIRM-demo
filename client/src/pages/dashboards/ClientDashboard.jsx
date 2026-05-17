import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Clock3, FileUp, History, SearchCheck, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import AppointmentCard from "../../components/AppointmentCard";
import EmptyState from "../../components/EmptyState";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import PriorityBadge from "../../components/PriorityBadge";
import StatCard from "../../components/StatCard";
import api, { unwrap } from "../../lib/api";

const consultationTypes = [
  { label: "Emergency consultation", priority: "HIGH" },
  { label: "Court deadline preparation", priority: "HIGH" },
  { label: "Urgent legal filing", priority: "HIGH" },
  { label: "Ongoing legal processing", priority: "MEDIUM" },
  { label: "Scheduled follow-up", priority: "MEDIUM" },
  { label: "General consultation", priority: "REGULAR" },
  { label: "Non-urgent concern", priority: "REGULAR" }
];

const priorityLabels = {
  HIGH: "High Priority",
  MEDIUM: "Medium Priority",
  REGULAR: "Regular Priority"
};

function suggestedPriorityFor(type) {
  return consultationTypes.find((item) => item.label === type)?.priority || "REGULAR";
}

export default function ClientDashboard() {
  const [lawyers, setLawyers] = useState([]);
  const [loadingLawyers, setLoadingLawyers] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [scan, setScan] = useState(null);
  const [checking, setChecking] = useState(false);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    consultationType: "General consultation",
    priority: "REGULAR",
    lawyerId: "",
    locationMode: "IN_PERSON",
    subject: "",
    description: "",
    preferredStart: "",
    preferredEnd: ""
  });

  const selectedPriority = useMemo(() => suggestedPriorityFor(form.consultationType), [form.consultationType]);

  useEffect(() => {
    let active = true;

    const loadLawyers = async () => {
      try {
        const response = await api.get("/lawyers");
        const data = unwrap(response);
        if (active) setLawyers(data.lawyers || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load lawyers");
        if (active) setLawyers([]);
      } finally {
        if (active) setLoadingLawyers(false);
      }
    };

    const loadAppointments = async () => {
      try {
        const response = await api.get("/appointments?limit=6");
        const data = unwrap(response);
        if (active) setAppointments(data.appointments || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load your appointments");
        if (active) setAppointments([]);
      } finally {
        if (active) setLoadingAppointments(false);
      }
    };

    loadLawyers();
    loadAppointments();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setForm((current) => ({ ...current, priority: selectedPriority }));
    setScan(null);
  }, [selectedPriority]);

  const lawyerOptions = lawyers.map((lawyer) => ({
    id: lawyer.id,
    name: lawyer.user?.name || "Unknown",
    specialty: lawyer.specialization
  }));

  const checkAvailability = async () => {
    if (!form.lawyerId) {
      toast.error("Select a lawyer to check availability");
      return;
    }
    if (!form.preferredStart || !form.preferredEnd) {
      toast.error("Select preferred start and end time first");
      return;
    }

    setChecking(true);
    try {
      const response = await api.post("/appointments/conflict-check", {
        lawyerId: form.lawyerId,
        consultationType: form.consultationType,
        preferredStart: form.preferredStart,
        preferredEnd: form.preferredEnd
      });
      const data = unwrap(response);
      setScan(data.conflictScan);
      toast.success(data.conflictScan.status === "CLEAR" ? "Schedule is available" : "Conflict scan completed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not check availability");
    } finally {
      setChecking(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form, lawyerId: form.lawyerId || undefined };
      const response = await api.post("/appointments", payload);
      const appointment = unwrap(response).appointment;

      if (files.length && appointment?.id) {
        const data = new FormData();
        files.forEach((file) => data.append("documents", file));
        await api.post(`/appointments/${appointment.id}/documents`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      toast.success("Appointment inquiry submitted for staff review");
      setForm({ consultationType: "General consultation", priority: "REGULAR", lawyerId: "", locationMode: "IN_PERSON", subject: "", description: "", preferredStart: "", preferredEnd: "" });
      setFiles([]);
      setScan(null);
      setAppointments((current) => [appointment, ...current].slice(0, 6));
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not submit appointment inquiry");
    }
  };

  const openRequests = appointments.filter((item) => ["PENDING", "RESCHEDULE_REQUESTED"].includes(item.status)).length;
  const completedCount = appointments.filter((item) => item.status === "COMPLETED").length;
  const nextConsult = appointments.find((item) => item.scheduledStart)?.scheduledStart || "TBD";
  const documentCount = appointments.reduce((sum, item) => sum + (item.documents?.length || 0), 0);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarPlus} label="Open requests" value={openRequests.toString()} trend={openRequests ? `${openRequests} pending review` : "No pending requests"} />
        <StatCard icon={Clock3} label="Next consult" value={nextConsult === "TBD" ? nextConsult : new Date(nextConsult).toLocaleDateString()} trend="Confirmed timeline" tone="brass" />
        <StatCard icon={FileUp} label="Documents" value={documentCount.toString()} trend="Uploaded this week" tone="blue" />
        <StatCard icon={History} label="Completed" value={completedCount.toString()} trend="Recent client progress" tone="jade" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-lg border border-ink-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-ink-900 dark:text-white">Submit appointment inquiry</h2>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-100">Choose the consultation category, preferred schedule, lawyer, and supporting documents.</p>
            </div>
            <PriorityBadge priority={priorityLabels[form.priority]} />
          </div>
          <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Consultation type
              <select value={form.consultationType} onChange={(event) => setForm((current) => ({ ...current, consultationType: event.target.value }))} className="focus-ring rounded-lg border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950">
                {consultationTypes.map((type) => <option key={type.label}>{type.label}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Priority level
              <select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))} className="focus-ring rounded-lg border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950">
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="REGULAR">Regular Priority</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Preferred lawyer
              <select value={form.lawyerId} onChange={(event) => { setForm((current) => ({ ...current, lawyerId: event.target.value })); setScan(null); }} className="focus-ring rounded-lg border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950">
                <option value="">Let staff assign</option>
                {lawyerOptions.map((lawyer, index) => (
                  <option key={`${lawyer.name}-${index}`} value={lawyer.id}>
                    {lawyer.name} {lawyer.specialty ? `- ${lawyer.specialty}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Subject
              <input required value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} className="focus-ring rounded-lg border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Preferred start
              <input required type="datetime-local" value={form.preferredStart} onChange={(event) => setForm((current) => ({ ...current, preferredStart: event.target.value }))} className="focus-ring rounded-lg border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white">
              Preferred end
              <input required type="datetime-local" value={form.preferredEnd} onChange={(event) => setForm((current) => ({ ...current, preferredEnd: event.target.value }))} className="focus-ring rounded-lg border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white md:col-span-2">
              Supporting details
              <textarea required rows="4" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="focus-ring rounded-lg border border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-ink-700 dark:text-white md:col-span-2">
              Supporting documents
              <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={(event) => setFiles(Array.from(event.target.files || []))} className="focus-ring rounded-lg border border-dashed border-ink-100 px-3 py-3 dark:border-white/10 dark:bg-ink-950" />
            </label>
            <div className="rounded-lg border border-ink-100 bg-ink-50 p-4 dark:border-white/10 dark:bg-white/5 md:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-ink-900 dark:text-white">Rule-based availability check</p>
                  <p className="mt-1 text-xs font-semibold text-ink-500 dark:text-ink-100">Checks overlapping appointments, unavailable blocks, duplicate requests, and workload congestion.</p>
                </div>
                <button type="button" onClick={checkAvailability} disabled={checking || !form.lawyerId} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-ink-100 bg-white px-3 py-2 text-xs font-extrabold text-ink-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-ink-950 dark:text-white">
                  <SearchCheck size={16} /> {checking ? "Checking..." : "Check availability"}
                </button>
              </div>
              {scan && (
                <div className="mt-4 grid gap-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-extrabold text-ink-700 dark:bg-ink-950 dark:text-white">Status: {scan.status}</span>
                    {scan.warnings?.map((warning) => <span key={warning} className="rounded-lg bg-brass-100 px-2.5 py-1 text-xs font-extrabold text-brass-700">{warning}</span>)}
                  </div>
                  {scan.conflicts?.length > 0 && (
                    <ul className="grid gap-2">
                      {scan.conflicts.map((conflict) => <li key={conflict.type} className="rounded-lg bg-signal-coral/10 px-3 py-2 text-signal-coral">{conflict.message}</li>)}
                    </ul>
                  )}
                  {scan.recommendations?.length > 0 && (
                    <div>
                      <p className="text-xs font-extrabold uppercase text-ink-500 dark:text-ink-100">Recommended alternatives</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {scan.recommendations.map((slot) => (
                          <button key={slot.startsAt} type="button" onClick={() => setForm((current) => ({ ...current, preferredStart: slot.startsAt.slice(0, 16), preferredEnd: slot.endsAt.slice(0, 16) }))} className="rounded-lg border border-jade-400/30 bg-jade-100 px-3 py-2 text-xs font-extrabold text-jade-800">
                            {new Date(slot.startsAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button type="submit" className="focus-ring rounded-lg bg-ink-900 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-jade-800 dark:bg-jade-400 dark:text-ink-950 md:col-span-2">
              Submit inquiry
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-ink-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-jade-700 dark:text-jade-100" size={22} />
            <h2 className="text-lg font-extrabold text-ink-900 dark:text-white">Latest appointments</h2>
          </div>
          <div className="mt-5 grid gap-4">
            {loadingAppointments ? (
              <LoadingSkeleton rows={3} />
            ) : appointments.length > 0 ? (
              appointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)
            ) : (
              <EmptyState title="No recent appointments" message="Your booking history will appear here after your first inquiry." />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
