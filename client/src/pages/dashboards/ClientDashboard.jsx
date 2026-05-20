import { useEffect, useMemo, useState } from "react";
import {
  CalendarPlus,
  Clock3,
  FileUp,
  History,
  SearchCheck,
  ShieldAlert
} from "lucide-react";

import toast from "react-hot-toast";

import AppointmentCard from "../../components/AppointmentCard";
import EmptyState from "../../components/EmptyState";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import PriorityBadge from "../../components/PriorityBadge";
import StatCard from "../../components/StatCard";
<<<<<<< HEAD

=======
import { mapAppointment } from "../../features/appointments/mappers";
>>>>>>> fe1f118 (feat: integrate Supabase and enhance LFC scheduling system modules)
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

const fallbackLawyers = [
  {
    id: "fallback-1",
    name: "Atty. Elena Rivera",
    specialty: "Corporate Law"
  },
  {
    id: "fallback-2",
    name: "Atty. Marco Santos",
    specialty: "Civil Litigation"
  },
  {
    id: "fallback-3",
    name: "Atty. Nina Valdez",
    specialty: "Family Law"
  }
];

const fallbackAppointments = [
  {
    id: "appt-1",
    title: "General Legal Consultation",
    status: "Pending",
    priority: "Regular Priority",
    import { useEffect, useMemo, useState } from "react";
    import {
      CalendarPlus,
      Clock3,
      FileUp,
      History,
      SearchCheck,
      ShieldAlert
    } from "lucide-react";
    import toast from "react-hot-toast";

    import AppointmentCard from "../../components/AppointmentCard";
    import DashboardLayout from "../../components/DashboardLayout";
    import EmptyState from "../../components/EmptyState";
    import LoadingSkeleton from "../../components/LoadingSkeleton";
    import PriorityBadge from "../../components/PriorityBadge";
    import StatCard from "../../components/StatCard";
    import { mapAppointment } from "../../features/appointments/mappers";
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
        priority: "Regular Priority",
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
          .finally(() => {
            if (active) setLoading(false);
          });

        return () => {
          active = false;
        };
      }, []);

      useEffect(() => {
        setForm((current) => ({ ...current, priority: selectedPriority }));
        setScan(null);
      }, [selectedPriority]);

      const lawyerOptions = lawyers.length > 0
        ? lawyers.map((lawyer) => ({ id: lawyer.id, name: lawyer.user?.name || lawyer.name, specialty: lawyer.specialization || lawyer.specialty }))
        : fallbackLawyers;

      const requestsOpen = appointments.filter((item) => item.status !== "COMPLETED").length;
      const nextConsult = appointments.find((item) => item.scheduledStart || item.preferredStart);
      const nextLabel = nextConsult ? new Date(nextConsult.scheduledStart || nextConsult.preferredStart).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "No scheduled consult";

      const checkAvailability = async () => {
        if (!form.lawyerId) { toast.error("Select a lawyer first"); return; }
        if (!form.preferredStart || !form.preferredEnd) { toast.error("Select preferred schedule"); return; }
        setChecking(true);
        try {
          const response = await api.post("/appointments/conflict-check", { lawyerId: form.lawyerId, consultationType: form.consultationType, preferredStart: form.preferredStart, preferredEnd: form.preferredEnd });
          const data = unwrap(response);
          setScan(data.conflictScan);
          toast.success(data.conflictScan?.status === "CLEAR" ? "Schedule available" : "Conflict scan completed");
        } catch (error) {
          toast.error(error.response?.data?.message || "Could not check schedule");
        } finally { setChecking(false); }
      };

      const submit = async (event) => {
        event.preventDefault();
        try {
          const payload = { ...form, lawyerId: form.lawyerId || undefined };
          const response = await api.post("/appointments", payload);
          const appointment = unwrap(response).appointment;
          const normalized = mapAppointment(appointment);
          if (files.length && appointment?.id) {
            const data = new FormData(); files.forEach((file) => data.append("documents", file));
            await api.post(`/appointments/${appointment.id}/documents`, data, { headers: { "Content-Type": "multipart/form-data" } });
          }
          toast.success("Appointment inquiry submitted");
          setForm({ consultationType: "General consultation", priority: "REGULAR", lawyerId: "", locationMode: "IN_PERSON", subject: "", description: "", preferredStart: "", preferredEnd: "" });
          setFiles([]); setScan(null);
          if (normalized) setAppointments((current) => [normalized, ...current].slice(0, 5));
        } catch (error) { toast.error(error.response?.data?.message || "Could not submit appointment"); }
      };

      return (
        <DashboardLayout>
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={CalendarPlus} label="Open requests" value={loading ? "..." : `${requestsOpen}`} trend="1 needs verification" />
              <StatCard icon={Clock3} label="Next consult" value={loading ? "..." : nextLabel.split(",")[0]} trend={loading ? "Loading..." : nextLabel.split(",")[1]?.trim() || nextLabel} tone="brass" />
              <StatCard icon={FileUp} label="Documents" value={loading ? "..." : `${files.length}`} trend="Ready to attach" tone="blue" />
              <StatCard icon={History} label="Consultation type" value={selectedPriority} trend={priorityLabels[selectedPriority] || "Priority updated"} tone="jade" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
              <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-ink-900 dark:text-white">Submit appointment inquiry</h2>
                    <p className="mt-1 text-sm text-ink-500 dark:text-ink-100">Choose consultation type, preferred schedule, and supporting documents.</p>
                  </div>
                  <PriorityBadge priority={priorityLabels[form.priority]} />
                </div>

                <form onSubmit={submit} className="mt-6 grid gap-4">
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

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-bold">Preferred start</span>
                      <input type="datetime-local" value={form.preferredStart} onChange={(event) => setForm((current) => ({ ...current, preferredStart: event.target.value }))} className="rounded-2xl border border-ink-100 px-4 py-3 dark:border-white/10 dark:bg-ink-950" />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-bold">Preferred end</span>
                      <input type="datetime-local" value={form.preferredEnd} onChange={(event) => setForm((current) => ({ ...current, preferredEnd: event.target.value }))} className="rounded-2xl border border-ink-100 px-4 py-3 dark:border-white/10 dark:bg-ink-950" />
                    </label>
                  </div>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold">Subject</span>
                    <input value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} className="rounded-2xl border border-ink-100 px-4 py-3 dark:border-white/10 dark:bg-ink-950" />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold">Description</span>
                    <textarea rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="rounded-2xl border border-ink-100 px-4 py-3 dark:border-white/10 dark:bg-ink-950" />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold">Supporting documents</span>
                    <input type="file" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} className="rounded-2xl border border-dashed border-ink-200 px-4 py-3 text-sm dark:border-white/10" />
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={checkAvailability} disabled={checking} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-jade-700 px-4 py-3 text-sm font-bold text-white"><SearchCheck size={16} />{checking ? "Checking..." : "Check availability"}</button>
                    <button type="submit" className="rounded-2xl bg-ink-900 px-5 py-3 text-sm font-bold text-white dark:bg-jade-400 dark:text-ink-950">Submit inquiry</button>
                  </div>
                </form>

                {scan && (
                  <div className="mt-6 rounded-2xl border border-jade-200 bg-jade-50 p-4 text-sm text-ink-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                    <p className="font-extrabold uppercase text-jade-700 dark:text-jade-100">Latest conflict scan</p>
                    <p className="mt-2">Status: <span className="font-bold">{scan.status}</span></p>
                    {scan.reason && <p className="mt-1 text-ink-600 dark:text-ink-100">{scan.reason}</p>}
                    {scan.suggestions?.length ? <ul className="mt-3 grid gap-1 text-ink-600 dark:text-ink-100">{scan.suggestions.map((s) => <li key={s}>• {s}</li>)}</ul> : null}
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="text-jade-700 dark:text-jade-100" size={22} />
                  <h2 className="text-lg font-extrabold text-ink-900 dark:text-white">Latest appointments</h2>
                </div>

                <div className="mt-5 grid gap-4">
                  {loading ? <LoadingSkeleton rows={3} /> : appointments.length ? appointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />) : <EmptyState title="No appointments yet" message="Your consultation requests and schedules will appear here." />}
                </div>
              </section>
            </div>
          </div>
        </DashboardLayout>
      );
    }
        lawyerId: "",
        locationMode: "IN_PERSON",
        subject: "",
        description: "",
        preferredStart: "",
        preferredEnd: ""
      });

      setFiles([]);
      setScan(null);
=======
      setAppointments((current) => [normalized, ...current].slice(0, 5));
>>>>>>> fe1f118 (feat: integrate Supabase and enhance LFC scheduling system modules)
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not submit appointment"
      );
    }
  };

<<<<<<< HEAD
  return (
    <DashboardLayout>
      <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarPlus}
          label="Open requests"
          value="3"
          trend="1 needs verification"
        />

        <StatCard
          icon={Clock3}
          label="Next consult"
          value="May 14"
          trend="9:00 AM"
          tone="brass"
        />

        <StatCard
          icon={FileUp}
          label="Documents"
          value="8"
          trend="2 uploaded this week"
          tone="blue"
        />

        <StatCard
          icon={History}
          label="Completed"
          value="14"
          trend="Last 12 months"
          tone="jade"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-ink-900 dark:text-white">
                Submit appointment inquiry
              </h2>

              <p className="mt-1 text-sm text-ink-500 dark:text-ink-100">
                Choose consultation type,
                preferred schedule, and
                supporting documents.
              </p>
            </div>

            <PriorityBadge
              priority={
                priorityLabels[
                  form.priority
                ]
              }
            />
          </div>

          <form
            onSubmit={submit}
            className="mt-6 grid gap-4"
          >
            <label className="grid gap-2">
              <span className="text-sm font-bold">
                Consultation type
              </span>

              <select
                value={
                  form.consultationType
                }
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    consultationType:
                      event.target.value
                  }))
                }
                className="rounded-2xl border border-ink-100 px-4 py-3 dark:border-white/10 dark:bg-ink-950"
              >
                {consultationTypes.map(
                  (type) => (
                    <option
                      key={type.label}
                      value={type.label}
                    >
                      {type.label}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold">
                Preferred lawyer
              </span>

              <select
                value={form.lawyerId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    lawyerId:
                      event.target.value
                  }))
                }
                className="rounded-2xl border border-ink-100 px-4 py-3 dark:border-white/10 dark:bg-ink-950"
              >
                <option value="">
                  Let staff assign
                </option>

                {lawyerOptions.map(
                  (lawyer) => (
                    <option
                      key={lawyer.id}
                      value={lawyer.id}
                    >
                      {lawyer.name}
                    </option>
                  )
                )}
              </select>
            </label>

            <button
              type="button"
              onClick={
                checkAvailability
              }
              disabled={checking}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-jade-700 px-4 py-3 text-sm font-bold text-white"
            >
              <SearchCheck size={16} />

              {checking
                ? "Checking..."
                : "Check availability"}
            </button>

            <button
              type="submit"
              className="rounded-2xl bg-ink-900 px-5 py-3 text-sm font-bold text-white dark:bg-jade-400 dark:text-ink-950"
            >
              Submit inquiry
            </button>
          </form>

          {scan && (
            <div className="mt-6 rounded-2xl border border-jade-200 bg-jade-50 p-4 text-sm text-ink-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
              <p className="font-extrabold uppercase text-jade-700 dark:text-jade-100">
                Latest conflict scan
              </p>
              <p className="mt-2">
                Status: <span className="font-bold">{scan.status}</span>
              </p>
              {scan.reason && <p className="mt-1 text-ink-600 dark:text-ink-100">{scan.reason}</p>}
              {scan.suggestions?.length ? (
                <ul className="mt-3 grid gap-1 text-ink-600 dark:text-ink-100">
                  {scan.suggestions.map((suggestion) => (
                    <li key={suggestion}>• {suggestion}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <ShieldAlert
              className="text-jade-700 dark:text-jade-100"
              size={22}
            />

            <h2 className="text-lg font-extrabold text-ink-900 dark:text-white">
              Latest appointments
            </h2>
          </div>

          <div className="mt-5 grid gap-4">
            {loadingLawyers ? (
              <LoadingSkeleton rows={3} />
            ) : appointments?.length ? (
              appointments.map(
                (appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={
                      appointment
                    }
                  />
                )
              )
            ) : (
              <EmptyState
                title="No appointments yet"
                message="Your consultation requests and schedules will appear here."
              />
            )}
          </div>
        </section>
      </div>
      </div>
    </DashboardLayout>
  );
}