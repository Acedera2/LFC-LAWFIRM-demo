#!/usr/bin/env node
// ESM smoke test using node's global fetch (Node 18+)
const ports = Array.from({ length: 11 }, (_, i) => 5000 + i);

async function findServer() {
  for (const p of ports) {
    try {
      const res = await fetch(`http://localhost:${p}/health`, { method: 'GET' });
      if (res.ok) return `http://localhost:${p}`;
    } catch (e) {
      // continue
    }
  }
  throw new Error('No demo server found on ports 5000-5010');
}

async function run() {
  try {
    const base = await findServer();
    console.log('Found demo server at', base);

    const loginResp = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@lfcfirm.com', password: 'Password123!' })
    });
    if (loginResp.status !== 200) {
      console.error('Login failed:', loginResp.status);
      console.error(await loginResp.text());
      process.exit(2);
    }
    const loginBody = await loginResp.json();
    console.log('Login OK. User:', loginBody.data?.user?.email || loginBody.data?.user?.name);

    const apptPayload = {
      clientId: loginBody.data.user.id,
      lawyerId: 'lawyer_1',
      consultationType: 'consultation',
      subject: 'Smoke test appointment',
      description: 'Created by smoke test',
      priority: 'REGULAR',
      preferredStart: '2026-05-25T14:00:00.000Z',
      preferredEnd: '2026-05-25T14:30:00.000Z',
      locationMode: 'IN_PERSON'
    };

    const createResp = await fetch(`${base}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apptPayload)
    });
    if (![200,201].includes(createResp.status)) {
      console.error('Create appointment failed:', createResp.status);
      console.error(await createResp.text());
      process.exit(3);
    }
    const created = await createResp.json();
    console.log('Created appointment id:', created.id || created.data?.id || JSON.stringify(created));

    const conflictResp = await fetch(`${base}/api/appointments/conflict-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lawyerId: 'lawyer_1', preferredStart: '2026-05-25T14:00:00.000Z', preferredEnd: '2026-05-25T14:30:00.000Z' })
    });
    const conflictBody = await conflictResp.json();
    console.log('Conflict check result:', JSON.stringify(conflictBody));

    console.log('Smoke test completed successfully');
    await new Promise(r => setTimeout(r, 150));
    setImmediate(() => process.exit(0));
  } catch (err) {
    console.error('Smoke test failed:', err.message || err);
    await new Promise(r => setTimeout(r, 150));
    setImmediate(() => process.exit(1));
  }
}

run();
