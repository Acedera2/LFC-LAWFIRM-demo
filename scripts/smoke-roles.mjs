#!/usr/bin/env node
// Role-based ESM smoke test: client -> staff -> lawyer -> admin flows
const ports = Array.from({ length: 11 }, (_, i) => 5000 + i);

function parseSetCookie(setCookieHeaders) {
  const cookies = {};
  for (const header of setCookieHeaders || []) {
    const [pair] = header.split(';');
    const [k, v] = pair.split('=');
    cookies[k.trim()] = v;
  }
  return cookies;
}

async function findServer() {
  for (const p of ports) {
    try {
      const res = await fetch(`http://localhost:${p}/health`);
      if (res.ok) return `http://localhost:${p}`;
    } catch (e) {}
  }
  throw new Error('No demo server found on ports 5000-5010');
}

async function getCsrf(base) {
  const res = await fetch(`${base}/api/auth/csrf`);
  const raw = res.headers.raw ? res.headers.raw()['set-cookie'] : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
  const cookies = parseSetCookie(raw);
  return { token: decodeURIComponent(cookies['lfc_csrf'] || ''), cookies };
}

async function login(base, email, password) {
  const { token, cookies } = await getCsrf(base);
  const loginRes = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token, 'Cookie': Object.entries(cookies).map(([k,v]) => `${k}=${v}`).join('; ') },
    body: JSON.stringify({ email, password })
  });
  if (loginRes.status !== 200) throw new Error(`Login failed for ${email}: ${loginRes.status}`);
  const raw = loginRes.headers.raw ? loginRes.headers.raw()['set-cookie'] : (loginRes.headers.get('set-cookie') ? [loginRes.headers.get('set-cookie')] : []);
  const loginCookies = parseSetCookie(raw);
  const body = await loginRes.json();
  return { user: body.data?.user || body.data || body, cookies: { ...cookies, ...loginCookies }, token };
}

async function run() {
  const base = await findServer();
  console.log('Found demo server at', base);

  // Client creates appointment
  const client = await login(base, 'client@demo.com', 'Password123!').catch(e => { console.error('Client login failed', e.message); process.exit(2); });
  console.log('Client logged in:', client.user.email || client.user.name);
  const cookieHeaderClient = Object.entries(client.cookies).map(([k,v]) => `${k}=${v}`).join('; ');

  const apptPayload = {
    lawyerId: 'lawyer_1',
    consultationType: 'consultation',
    subject: 'Role smoke test appointment',
    description: 'Created by role smoke test',
    priority: 'REGULAR',
    preferredStart: '2026-05-25T14:00:00.000Z',
    preferredEnd: '2026-05-25T14:30:00.000Z',
    locationMode: 'IN_PERSON'
  };

  const createRes = await fetch(`${base}/api/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeaderClient, 'X-CSRF-Token': client.token },
    body: JSON.stringify(apptPayload)
  });
  if (![200,201].includes(createRes.status)) { console.error('Client create appointment failed', createRes.status, await createRes.text()); process.exit(3); }
  const created = await createRes.json();
  const apptId = created.data?.appointment?.id || created.appointment?.id || created.id || (created.data && created.data.id) || (created.id);
  console.log('Client created appointment', apptId);

  // Staff approves the appointment
  const staff = await login(base, 'staff@lfcfirm.com', 'Password123!').catch(e => { console.error('Staff login failed', e.message); process.exit(4); });
  console.log('Staff logged in:', staff.user.email || staff.user.name);
  const cookieHeaderStaff = Object.entries(staff.cookies).map(([k,v]) => `${k}=${v}`).join('; ');
  const approveRes = await fetch(`${base}/api/appointments/${apptId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeaderStaff, 'X-CSRF-Token': staff.token },
    body: JSON.stringify({ status: 'APPROVED', scheduledStart: '2026-05-25T14:00:00.000Z', scheduledEnd: '2026-05-25T14:30:00.000Z' })
  });
  if (![200,201].includes(approveRes.status)) { console.error('Staff approve failed', approveRes.status, await approveRes.text()); process.exit(5); }
  const approved = await approveRes.json();
  console.log('Staff approved appointment:', approved.data?.appointment?.status || approved.appointment?.status || approved.status || 'ok');

  // Lawyer accepts (confirm scheduling)
  const lawyer = await login(base, 'attorney.rivera@lfcfirm.com', 'Password123!').catch(e => { console.error('Lawyer login failed', e.message); process.exit(6); });
  console.log('Lawyer logged in:', lawyer.user.email || lawyer.user.name);
  const cookieHeaderLawyer = Object.entries(lawyer.cookies).map(([k,v]) => `${k}=${v}`).join('; ');
  const acceptRes = await fetch(`${base}/api/appointments/${apptId}/accept`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeaderLawyer, 'X-CSRF-Token': lawyer.token }
  });
  if (![200,201].includes(acceptRes.status)) { console.error('Lawyer accept failed', acceptRes.status, await acceptRes.text()); process.exit(7); }
  const accepted = await acceptRes.json();
  console.log('Lawyer accepted appointment status:', accepted.data?.appointment?.status || accepted.appointment?.status || 'CONFIRMED');

  // Admin can view and generate reports (quick check: list appointments)
  const admin = await login(base, 'admin@lfcfirm.com', 'Password123!').catch(e => { console.error('Admin login failed', e.message); process.exit(8); });
  console.log('Admin logged in:', admin.user.email || admin.user.name);
  const cookieHeaderAdmin = Object.entries(admin.cookies).map(([k,v]) => `${k}=${v}`).join('; ');
  const listRes = await fetch(`${base}/api/appointments?limit=10`, { headers: { 'Cookie': cookieHeaderAdmin } });
  if (listRes.status !== 200) { console.error('Admin list failed', listRes.status, await listRes.text()); process.exit(9); }
  const listBody = await listRes.json();
  console.log('Admin can list appointments, count:', (listBody.data?.appointments || listBody.appointments || []).length);

  console.log('Role-based smoke test completed successfully');
  process.exit(0);
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
