import pkg from 'playwright/test';

const { test, expect } = pkg;
const BASE = process.env.BASE_URL || 'http://127.0.0.1:5174';

test('staff reschedule flow (mock-first)', async ({ page }) => {
  await page.goto(BASE);
  const hasMock = await page.evaluate(() => typeof window.MockApi !== 'undefined' && typeof window.MockStore !== 'undefined');
  if (!hasMock) return;

  // create an appointment
  const now = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30, 0).toISOString();

  const appt = await page.evaluate(async ({ start, end }) => {
    const payload = { clientId: 'user_client_1', consultationType: 'Follow-up', subject: 'Reschedule test', preferredStart: start, preferredEnd: end };
    const r = await window.MockApi.request({ method: 'post', url: '/appointments', data: payload });
    return r.data.data.appointment;
  }, { start, end });

  expect(appt).toBeTruthy();

  // staff reschedules to a new time
  const newStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0, 0).toISOString();
  const newEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 30, 0).toISOString();

  const updated = await page.evaluate(async ({ id, newStart, newEnd }) => {
    const r = await window.MockApi.request({ method: 'patch', url: `/appointments/${id}`, data: { scheduledStart: newStart, scheduledEnd: newEnd, status: 'SCHEDULED', historyItem: { action: 'RESCHEDULED', note: 'Staff rescheduled' } } });
    return r.data.data.appointment;
  }, { id: appt.id, newStart, newEnd });

  expect(updated.scheduledStart).toBe(newStart);
  expect(updated.status).toBe('SCHEDULED');
});
