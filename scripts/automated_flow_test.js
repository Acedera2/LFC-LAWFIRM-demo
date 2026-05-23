import fs from 'fs';
import path from 'path';

const base = 'http://127.0.0.1:5000';
const cookie = 'demo_user=user_client_1';
const headers = { 'Content-Type': 'application/json', 'Cookie': cookie };

async function run() {
  try {
    // Create appointment
    const createPayload = {
      subject: 'Automated test appt',
      consultationType: 'Test',
      preferredStart: '2026-06-01T10:00:00.000Z',
      preferredEnd: '2026-06-01T10:30:00.000Z',
      lawyerId: 'lawyer_1'
    };
    const createRes = await fetch(`${base}/api/appointments`, { method: 'POST', headers, body: JSON.stringify(createPayload) });
    const createJson = await createRes.json().catch(() => null);
    fs.writeFileSync(path.resolve(process.cwd(), 'server_create.json'), JSON.stringify({ status: createRes.status, body: createJson }, null, 2));
    const apptId = createJson?.data?.appointment?.id;
    console.log('created:', apptId || 'NO_ID');

    // Conflict check
    const conflictPayload = { lawyerId: 'lawyer_1', preferredStart: createPayload.preferredStart, preferredEnd: createPayload.preferredEnd };
    const conflictRes = await fetch(`${base}/api/appointments/conflict-check`, { method: 'POST', headers, body: JSON.stringify(conflictPayload) });
    const conflictJson = await conflictRes.json().catch(() => null);
    fs.writeFileSync(path.resolve(process.cwd(), 'server_conflict.json'), JSON.stringify({ status: conflictRes.status, body: conflictJson }, null, 2));
    console.log('conflict:', conflictJson);

    if (!apptId) return;

    // Patch appointment (schedule)
    const patchPayload = { status: 'SCHEDULED', scheduledStart: createPayload.preferredStart, scheduledEnd: createPayload.preferredEnd };
    const patchRes = await fetch(`${base}/api/appointments/${apptId}`, { method: 'PATCH', headers, body: JSON.stringify(patchPayload) });
    const patchJson = await patchRes.json().catch(() => null);
    fs.writeFileSync(path.resolve(process.cwd(), 'server_patch.json'), JSON.stringify({ status: patchRes.status, body: patchJson }, null, 2));
    console.log('patched:', patchJson?.data?.appointment?.id || 'PATCH_NO_ID');

    // Delete (cancel)
    const delRes = await fetch(`${base}/api/appointments/${apptId}`, { method: 'DELETE', headers, body: JSON.stringify({ reason: 'Automated test cancel' }) });
    const delJson = await delRes.json().catch(() => null);
    fs.writeFileSync(path.resolve(process.cwd(), 'server_delete.json'), JSON.stringify({ status: delRes.status, body: delJson }, null, 2));
    console.log('deleted/cancelled:', delJson?.data?.appointment?.id || 'DELETE_NO_ID');

  } catch (err) {
    console.error('error', err);
  }
}

run();
