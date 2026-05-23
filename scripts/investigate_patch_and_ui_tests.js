import fs from 'fs';
import path from 'path';

const base = process.env.BASE || 'http://127.0.0.1:5000';

function save(name, obj) {
  fs.writeFileSync(path.resolve(process.cwd(), name), JSON.stringify(obj, null, 2));
}

async function run() {
  try {
    // Create a fresh appointment on the target server to ensure it exists in this process
    const clientCookie = 'demo_user=user_client_1';
    const createPayload = {
      subject: 'Automated test appt',
      consultationType: 'Test',
      preferredStart: '2026-06-01T10:00:00.000Z',
      preferredEnd: '2026-06-01T10:30:00.000Z',
      lawyerId: 'lawyer_1'
    };
    let resCreate = await fetch(`${base}/api/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': clientCookie }, body: JSON.stringify(createPayload) });
    const created = await resCreate.json().catch(() => null);
    save('server_create_remote.json', { status: resCreate.status, body: created });
    const apptId = created?.data?.appointment?.id;
    console.log('created apptId:', apptId);
    if (!apptId) throw new Error('Failed to create appointment on ' + base);

    // PATCH as client
    let res = await fetch(`${base}/api/appointments/${apptId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Cookie': clientCookie },
      body: JSON.stringify({ status: 'SCHEDULED', scheduledStart: '2026-06-01T10:00:00.000Z', scheduledEnd: '2026-06-01T10:30:00.000Z' })
    });
    const jsonPatchClient = await res.text().then(t => { try { return JSON.parse(t); } catch(e){ return t; } });
    save('server_patch_client.json', { status: res.status, body: jsonPatchClient });
    console.log('client PATCH status', res.status);

    // Login as staff to get cookie
    res = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'staff@lfcfirm.com', password: 'Password123!' }) });
    const setCookie = res.headers.get('set-cookie');
    const staffBody = await res.json().catch(() => null);
    save('server_login_staff.json', { status: res.status, setCookie, body: staffBody });
    const staffCookie = setCookie ? setCookie.split(';')[0] : null;
    console.log('staffCookie:', staffCookie);

    if (staffCookie) {
      // Try PATCH /api/appointments/:id/status as staff
      res = await fetch(`${base}/api/appointments/${apptId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Cookie': staffCookie },
        body: JSON.stringify({ status: 'CONFIRMED', scheduledStart: '2026-06-01T10:00:00.000Z', scheduledEnd: '2026-06-01T10:30:00.000Z', lawyerId: 'lawyer_1' })
      });
      const jsonStatus = await res.json().catch(() => null);
      save('server_patch_status_staff.json', { status: res.status, body: jsonStatus });
      console.log('staff status PATCH', res.status);

      // Also try PATCH /api/appointments/:id as staff
      res = await fetch(`${base}/api/appointments/${apptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Cookie': staffCookie },
        body: JSON.stringify({ status: 'CONFIRMED', scheduledStart: '2026-06-01T10:00:00.000Z', scheduledEnd: '2026-06-01T10:30:00.000Z' })
      });
      const jsonPatchStaff = await res.json().catch(() => null);
      save('server_patch_staff.json', { status: res.status, body: jsonPatchStaff });
      console.log('staff PATCH /api/appointments/:id', res.status);
    }

    // Notifications as client
    res = await fetch(`${base}/api/notifications`, { method: 'GET', headers: { 'Cookie': clientCookie } });
    const notes = await res.json().catch(() => null);
    save('server_notifications_client.json', { status: res.status, body: notes });
    console.log('notifications fetched', res.status);

    // Mark read-all as client
    res = await fetch(`${base}/api/notifications/read-all`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Cookie': clientCookie } });
    const readAll = await res.json().catch(() => null);
    save('server_notifications_readall.json', { status: res.status, body: readAll });
    console.log('notifications read-all', res.status);

    // Update profile as client
    res = await fetch(`${base}/api/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Cookie': clientCookie }, body: JSON.stringify({ name: 'Client User Updated', email: 'client+updated@demo.com' }) });
    const profileUpdate = await res.json().catch(() => null);
    save('server_profile_update.json', { status: res.status, body: profileUpdate });
    console.log('profile update', res.status);

    // Login as admin and update settings
    res = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@lfcfirm.com', password: 'Password123!' }) });
    const adminSetCookie = res.headers.get('set-cookie');
    const adminCookie = adminSetCookie ? adminSetCookie.split(';')[0] : null;
    save('server_login_admin.json', { status: res.status, setCookie: adminSetCookie, body: await res.json().catch(()=>null) });
    if (adminCookie) {
      res = await fetch(`${base}/api/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie }, body: JSON.stringify({ key: 'maxBookingDays', value: 120 }) });
      const settingsRes = await res.json().catch(() => null);
      save('server_settings_update.json', { status: res.status, body: settingsRes });
      console.log('settings update', res.status);
    }

  } catch (err) {
    console.error('error', err);
    save('investigate_error.json', { error: String(err) });
  }
}

run();
