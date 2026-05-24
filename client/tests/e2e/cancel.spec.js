const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://localhost:5173';

test('client cancellation flow (mock-first)', async ({ page }) => {
  await page.goto(BASE);
  const hasMock = await page.evaluate(() => typeof window.MockApi !== 'undefined' && typeof window.MockStore !== 'undefined');
  if (!hasMock) return;

  // create an appointment
  const now = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30, 0).toISOString();

  const appt = await page.evaluate(async ({ start, end }) => {
    const payload = { clientId: 'user_client_1', consultationType: 'Cancellation test', subject: 'Cancel me', preferredStart: start, preferredEnd: end };
    const r = await window.MockApi.request({ method: 'post', url: '/appointments', data: payload });
    return r.data.data.appointment;
  }, { start, end });

  expect(appt).toBeTruthy();

  // client requests cancellation
  const ok = await page.evaluate(async (id) => {
    const r = await window.MockApi.request({ method: 'delete', url: `/appointments/${id}` });
    return r.data.data.ok;
  }, appt.id);

  expect(ok).toBe(true);
});
