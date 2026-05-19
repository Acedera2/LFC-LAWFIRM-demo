const statusLabelMap = {
  PENDING: "Submitted",
  RESCHEDULE_REQUESTED: "Reschedule Requested",
  SCHEDULED: "Scheduled",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled"
};

const priorityLabelMap = {
  HIGH: "Urgent",
  MEDIUM: "Moderate",
  REGULAR: "Regular"
};

export function toDateTimeInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export function mapAppointment(appointment) {
  if (!appointment) return null;
  return {
    ...appointment,
    displayStatus: statusLabelMap[appointment.status] || appointment.status || "Unknown",
    displayPriority: priorityLabelMap[appointment.priority] || appointment.priority || "Regular",
    lawyerName: appointment.lawyer?.user?.name || "Unassigned",
    clientName: appointment.client?.name || "Client",
    startAt: appointment.scheduledStart || appointment.preferredStart || null,
    endAt: appointment.scheduledEnd || appointment.preferredEnd || null,
    isRecurring: appointment.consultationType?.toLowerCase().includes("follow") || appointment.consultationType?.toLowerCase().includes("recurring") || false
  };
}

export function countByStatus(items = []) {
  return items.reduce((acc, item) => {
    const key = item.status || "UNKNOWN";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

export function buildClientTimeline(appointments = []) {
  return appointments
    .flatMap((appointment) => {
      const history = appointment.history || [];
      if (history.length === 0) {
        return [
          {
            id: `${appointment.id}-created`,
            appointmentId: appointment.id,
            action: "INQUIRY_CREATED",
            note: appointment.subject,
            createdAt: appointment.createdAt
          }
        ];
      }
      return history.map((entry) => ({
        id: entry.id,
        appointmentId: appointment.id,
        action: entry.action,
        note: entry.note,
        createdAt: entry.createdAt
      }));
    })
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}
