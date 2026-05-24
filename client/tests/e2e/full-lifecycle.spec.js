import pkg from 'playwright/test';

const { test, expect } = pkg;
const BASE = process.env.BASE_URL || 'http://127.0.0.1:5174';

test('full lifecycle: client request -> staff approve (mock-first)', async ({ page }) => {
  await page.goto(BASE);
  const hasMock = await page.evaluate(() => typeof window.MockApi !== 'undefined' && typeof window.MockStore !== 'undefined');
  if (!hasMock) return;

  // Ensure admin/staff/client users exist
  const clientUser = await page.evaluate(() => window.MockStore.findUserByEmail('client@demo.local') || window.MockStore.createUser({ name: 'E2E Client', email: 'client@demo.local', password: 'Password123!', role: 'client' }));
  const staffUser = await page.evaluate(() => window.MockStore.findUserByEmail('staff@demo.local') || window.MockStore.createUser({ name: 'E2E Staff', email: 'staff@demo.local', password: 'Password123!', role: 'staff' }));

  // Create appointment as client via MockApi
  const now = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30, 0).toISOString();

  const appt = await page.evaluate(async ({ start, end }) => {
    const payload = { clientId: 'user_client_1', lawyerId: 'lawyer_1', consultationType: 'General consultation', subject: 'E2E lifecycle test', description: 'Created by test', preferredStart: start, preferredEnd: end };
    const r = await window.MockApi.request({ method: 'post', url: '/appointments', data: payload });
    return r.data.data.appointment;
  }, { start, end });

  expect(appt).toBeTruthy();

  // Staff approves the appointment
  const updated = await page.evaluate(async (id) => {
    const r = await window.MockApi.request({ method: 'patch', url: `/appointments/${id}`, data: { status: 'APPROVED' } });
    return r.data.data.appointment;
  }, appt.id);

  expect(updated.status).toBe('APPROVED');

  // Ensure notifications exist for client and staff
  const notes = await page.evaluate(() => window.MockStore.getNotifications());
  expect(Array.isArray(notes)).toBe(true);
  const found = notes.find(n => n.message && n.message.includes('Appointment') || n.title && n.title.includes('Appointment'));
  expect(found).toBeTruthy();
});
