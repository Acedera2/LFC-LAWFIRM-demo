Demo README

Start the local demo server (no DB required):

```powershell
# from repository root
node server/dev-server.js
```

Open the client (dev server) with Vite (in a separate terminal):

```powershell
# from repo root
cd client
npm install
npm run dev
```

Quick smoke test (runs against the local demo server):

```powershell
# waits for /health then: creates an appt, staff assigns+schedule, lawyer accepts, fetches notifications
powershell -NoProfile -Command "& { $healthUrl='http://127.0.0.1:5000/health'; for($i=0;$i -lt 30;$i++){ try{ $r=Invoke-RestMethod -Method Get -Uri $healthUrl -TimeoutSec 2; if($r.ok){ Write-Output 'healthy'; break } } catch{}; Start-Sleep -Seconds 1 } ; $body=@{consultationType='Smoke test'; subject='Smoke test'; preferredStart='2026-06-01T09:00:00.000Z'; preferredEnd='2026-06-01T09:30:00.000Z'} | ConvertTo-Json; $resp=Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/appointments' -Method Post -Body $body -ContentType 'application/json'; Write-Output ('Created: ' + $resp.data.appointment.id); $id = $resp.data.appointment.id; $patch=@{status='SCHEDULED'; lawyerId='lawyer_001'; scheduledStart=$resp.data.appointment.preferredStart; scheduledEnd=$resp.data.appointment.preferredEnd} | ConvertTo-Json; Invoke-RestMethod -Uri ("http://127.0.0.1:5000/api/appointments/" + $id + "/status") -Method Patch -Body $patch -ContentType 'application/json' -Headers @{'Cookie'='demo_user=staff_001'}; Invoke-RestMethod -Uri ("http://127.0.0.1:5000/api/appointments/" + $id + "/accept") -Method Patch -Headers @{'Cookie'='demo_user=lawyer_001'}; $notes=Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/notifications' -Method Get -Headers @{'Cookie'='demo_user=staff_001'}; Write-Output ('Staff notifications count: ' + ($notes.data.notifications | Measure-Object).Count); }"
```

Notes:
- The demo server seeds sample users, lawyers (limited to 3 named attorneys), appointments and notifications.
- Authentication uses the `demo_user` cookie. Example demo user ids: `staff_001`, `lawyer_001`, `client_001`.
- The client can run in "mock" mode (browser localStorage) when `VITE_API_URL` is not set; the in-browser mock persists data under keys prefixed with `lfc_mock_`.

If you want, I can also:
- Add automated integration tests for the dev server.
- Wire a single-click script to open the client in a browser.
