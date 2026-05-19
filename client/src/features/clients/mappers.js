export function mapClientProfile(user, appointments = []) {
  const recurringSchedules = appointments.filter((item) => item.consultationType?.toLowerCase().includes("follow") || item.consultationType?.toLowerCase().includes("recurring"));
  const inquiryHistory = appointments.filter((item) => item.history?.some((entry) => entry.action === "INQUIRY_CREATED"));
  const assignedLawyers = Array.from(new Set(appointments.map((item) => item.lawyer?.user?.name).filter(Boolean)));

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    status: user.status,
    createdAt: user.createdAt,
    consultationHistoryCount: appointments.length,
    recurringSchedulesCount: recurringSchedules.length,
    inquiryHistoryCount: inquiryHistory.length,
    assignedLawyers
  };
}
