#!/usr/bin/env node
// Cookie-aware ESM smoke test for demo server
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

async function run() {
  const base = await findServer();
  console.log('Found demo server at', base);

  // get CSRF
  const csrfRes = await fetch(`${base}/api/auth/csrf`, { method: 'GET' });
  const csrfSet = csrfRes.headers.get('set-cookie');
  const csrfHeaders = csrfRes.headers.raw ? csrfRes.headers.raw()['set-cookie'] : (csrfSet ? [csrfSet] : []);
  const csrfCookies = parseSetCookie(csrfHeaders);
  const csrfToken = decodeURIComponent(csrfCookies['lfc_csrf'] || '');
  console.log('CSRF token length', csrfToken.length);

  // login
  const loginRes = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken, 'Cookie': `lfc_csrf=${encodeURIComponent(csrfToken)}` },
    body: JSON.stringify({ email: 'admin@lfcfirm.com', password: 'Password123!' })
  });
  console.log('Login status', loginRes.status);
  const loginSet = loginRes.headers.get('set-cookie');
  const loginHeaders = loginRes.headers.raw ? loginRes.headers.raw()['set-cookie'] : (loginSet ? [loginSet] : []);
  console.log('Login set-cookie headers', loginHeaders);
  const loginBody = await loginRes.json().catch(() => null);
  console.log('Login body', loginBody);

  // build cookie jar
  const jar = { ...csrfCookies, ...parseSetCookie(loginHeaders) };
  const cookieHeader = Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');

  // create appointment
  const apptPayload = {
    clientId: loginBody?.data?.user?.id || 'client_1',
    lawyerId: 'lawyer_1',
    consultationType: 'consultation',
    subject: 'Smoke test appointment (cookies)',
    description: 'Created by cookie-aware smoke test',
    priority: 'REGULAR',
    preferredStart: '2026-05-25T14:00:00.000Z',
    preferredEnd: '2026-05-25T14:30:00.000Z',
    locationMode: 'IN_PERSON'
  };

  const createRes = await fetch(`${base}/api/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader, 'X-CSRF-Token': csrfToken },
    body: JSON.stringify(apptPayload)
  });
  console.log('Create status', createRes.status);
  const created = await createRes.json().catch(() => null);
  console.log('Created', created);

  const conflictRes = await fetch(`${base}/api/appointments/conflict-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieHeader },
    body: JSON.stringify({ lawyerId: 'lawyer_1', preferredStart: '2026-05-25T14:00:00.000Z', preferredEnd: '2026-05-25T14:30:00.000Z' })
  });
  const conflictBody = await conflictRes.json().catch(() => null);
  console.log('Conflict check', conflictBody);

  console.log('Cookie-aware smoke test done');
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
