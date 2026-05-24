import api, { unwrap } from "../../lib/api";
import { mapAppointment } from "./mappers";

export async function fetchAppointments(params = {}) {
  const response = await api.get("/appointments", { params });
  const payload = unwrap(response);
  return {
    appointments: (payload.appointments || []).map(mapAppointment),
    pagination: response.data?.meta || null
  };
}

export async function fetchAppointmentById(id) {
  const response = await api.get(`/appointments/${id}`);
  const payload = unwrap(response) || {};
  const appt = payload.appointment || null;
  return appt ? mapAppointment(appt) : null;
}
