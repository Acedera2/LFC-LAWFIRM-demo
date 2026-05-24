import { useEffect, useMemo, useState } from "react";
import { Search, UsersRound } from "lucide-react";
import toast from "react-hot-toast";
import ChartCard from "../components/ChartCard";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";
import api, { unwrap } from "../lib/api";
import { buildClientTimeline } from "../features/appointments/mappers";

export default function ClientManagement() {
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 12, totalItems: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get("/users", {
        params: {
          page: meta.page,
          limit: meta.limit,
          role: "client",
          search: query || undefined
        }
      })
      .then((response) => {
        if (!active) return;
        setClients(unwrap(response).users || []);
        setMeta(response.data?.meta || { page: 1, limit: 12, totalItems: 0, totalPages: 1 });
      })
      .catch(() => {
        if (!active) return;
        toast.error("Could not load client records.");
        setClients([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [meta.page, meta.limit, query]);

  useEffect(() => {
    if (!selectedClient?.id) {
      setAppointments([]);
      return;
    }

    let active = true;
    api
      .get("/appointments", {
        params: {
          clientId: selectedClient.id,
          limit: 40,
          sortBy: "createdAt",
          sortOrder: "asc"
        }
      })
      .then((response) => {
        if (!active) return;
        setAppointments(unwrap(response).appointments || []);
      })
      .catch(() => {
        if (active) setAppointments([]);
      });

    return () => {
      active = false;
    };
  }, [selectedClient?.id]);

  const timeline = useMemo(() => buildClientTimeline(appointments), [appointments]);
  const totalClients = meta.totalItems || clients.length;
  const totalPages = meta.totalPages || 1;
  const currentPage = Math.min(meta.page || 1, totalPages);

  useEffect(() => {
    setMeta((current) => (current.page === 1 ? current : { ...current, page: 1 }));
  }, [query]);

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-extrabold uppercase text-jade-700 dark:text-jade-100">Client management</p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink-900 dark:text-white">Client records, inquiry history, and consultation timelines</h1>
        <p className="mt-2 max-w-3xl text-sm text-ink-500 dark:text-ink-100">Search by name or email, open a client to view their timeline, and use pagination to browse the full list without losing your place.</p>
      </div>

      <ChartCard title="Client records" subtitle="Search and review consultation history by client profile.">
        <div className="grid gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={18} />
              <input
                value={query}
                onChange={(event) => {
                  setMeta((current) => ({ ...current, page: 1 }));
                  setQuery(event.target.value);
                }}
                placeholder="Search client name or email"
                className="focus-ring w-full rounded-lg border border-ink-100 py-3 pl-10 pr-3 text-sm font-medium dark:border-white/10 dark:bg-ink-950"
              />
            </label>
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded-lg border border-ink-100 px-4 py-3 text-sm font-bold dark:border-white/10"
              >
                Clear search
              </button>
            ) : null}
          </div>
          <p className="text-xs font-semibold text-ink-500 dark:text-ink-100">Showing {clients.length} of {totalClients} clients on page {currentPage} of {totalPages}.</p>
          {loading ? (
            <LoadingSkeleton rows={5} />
          ) : clients.length === 0 ? (
            <EmptyState title="No clients found" message="Try a different search query or check user provisioning." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-ink-50 text-xs font-extrabold uppercase text-ink-500 dark:bg-white/5 dark:text-ink-100">
                  <tr>
                    <th className="px-3 py-2">Client</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Created</th>
                    <th className="px-3 py-2">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 dark:divide-white/10">
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td className="px-3 py-3 font-extrabold text-ink-900 dark:text-white">{client.name}</td>
                      <td className="px-3 py-3 text-ink-600 dark:text-ink-100">{client.email}</td>
                      <td className="px-3 py-3">{client.status}</td>
                      <td className="px-3 py-3 text-xs text-ink-500 dark:text-ink-100">{new Date(client.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedClient(client)}
                          className="focus-ring inline-flex items-center gap-2 rounded-lg border border-ink-100 px-3 py-1.5 text-xs font-extrabold text-ink-700 dark:border-white/10 dark:text-white"
                        >
                          <UsersRound size={14} /> Open timeline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between text-xs font-semibold text-ink-500 dark:text-ink-100">
            <span>Total clients: {totalClients}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setMeta((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
                className="rounded border border-ink-100 px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10"
              >
                Prev
              </button>
              <span>Page {currentPage} / {totalPages}</span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setMeta((current) => ({ ...current, page: Math.min(totalPages, current.page + 1) }))}
                className="rounded border border-ink-100 px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </ChartCard>

      {selectedClient && (
        <ChartCard
          title={`${selectedClient.name} Consultation Timeline`}
          subtitle="Chronological journey from inquiry submission to recurring consultation updates."
        >
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 bg-ink-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-bold text-ink-900 dark:text-white">{selectedClient.email}</p>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="text-xs font-extrabold text-ink-500 transition hover:text-jade-700 dark:text-ink-100 dark:hover:text-jade-100"
              >
                Close details
              </button>
            </div>
            {timeline.length === 0 ? (
              <EmptyState title="No timeline entries" message="This client has no recorded appointment history yet." />
            ) : (
              timeline.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-ink-100 p-3 dark:border-white/10">
                  <div>
                    <p className="text-sm font-extrabold text-ink-900 dark:text-white">{item.action.replaceAll("_", " ")}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-100">Reference: {item.appointmentId}</p>
                  </div>
                  <p className="text-xs font-semibold text-ink-500 dark:text-ink-100">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </ChartCard>
      )}
    </div>
  );
}
