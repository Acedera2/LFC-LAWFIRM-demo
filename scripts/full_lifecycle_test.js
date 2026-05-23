import fs from 'fs';
import path from 'path';

const base = process.env.BASE || 'http://127.0.0.1:6001';

function save(name, obj) {
  fs.writeFileSync(path.resolve(process.cwd(), name), JSON.stringify(obj, null, 2));
}

async function run() {
  try {
    // Client creates appointment
    const clientCookie = 'demo_user=user_client_1';
    const createPayload = { subject: 'Lifecycle test appt', consultationType: 'Lifecycle', preferredStart: '2026-06-02T09:00:00.000Z', preferredEnd: '2026-06-02T09:30:00.000Z', lawyerId: 'lawyer_1' };
    let res = await fetch(`${base}/api/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': clientCookie }, body: JSON.stringify(createPayload) });
    const createJson = await res.json().catch(() => null);
    save('server_full_create.json', { status: res.status, body: createJson });
    const apptId = createJson?.data?.appointment?.id;
    console.log('created:', apptId);

    // Staff schedules appointment via /status
    const staffLogin = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'staff@lfcfirm.com', password: 'Password123!' }) });
    const staffCookie = staffLogin.headers.get('set-cookie') ? staffLogin.headers.get('set-cookie').split(';')[0] : null;
    save('server_full_staff_login.json', { status: staffLogin.status, setCookie: staffLogin.headers.get('set-cookie') });
    console.log('staff cookie:', staffCookie);

    res = await fetch(`${base}/api/appointments/${apptId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Cookie': staffCookie }, body: JSON.stringify({ status: 'SCHEDULED', scheduledStart: createPayload.preferredStart, scheduledEnd: createPayload.preferredEnd, lawyerId: 'lawyer_1' }) });
    const staffStatusJson = await res.json().catch(() => null);
    save('server_full_staff_status.json', { status: res.status, body: staffStatusJson });
    console.log('staff scheduled:', res.status);

    // Lawyer accepts via /accept (must login as lawyer)
    const lawyerEmail = findLawyerEmail();
    const lawyerLogin = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: lawyerEmail, password: 'Password123!' }) });
    const lawyerCookie = lawyerLogin.headers.get('set-cookie') ? lawyerLogin.headers.get('set-cookie').split(';')[0] : null;
    save('server_full_lawyer_login.json', { status: lawyerLogin.status, setCookie: lawyerLogin.headers.get('set-cookie'), body: await lawyerLogin.json().catch(()=>null) });
    console.log('lawyer cookie:', lawyerCookie);

    res = await fetch(`${base}/api/appointments/${apptId}/accept`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Cookie': lawyerCookie } });
    const lawyerAcceptJson = await res.json().catch(()=>null);
    save('server_full_lawyer_accept.json', { status: res.status, body: lawyerAcceptJson });
    console.log('lawyer accepted:', res.status);

    // Client cancels (DELETE)
    res = await fetch(`${base}/api/appointments/${apptId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Cookie': clientCookie }, body: JSON.stringify({ reason: 'Lifecycle cancel' }) });
    const clientDeleteJson = await res.json().catch(()=>null);
    save('server_full_client_delete.json', { status: res.status, body: clientDeleteJson });
    console.log('client cancelled:', res.status);

  } catch (err) {
    console.error('error', err);
    save('server_full_error.json', { error: String(err) });
  }
}

function findLawyerEmail() {
  // Use a seeded lawyer email from dev-data.json default 'attorney.rivera@lfcfirm.com'
  return 'attorney.rivera@lfcfirm.com';
}

run();
