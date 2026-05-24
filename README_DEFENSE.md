Defense Checklist — Feature → Prototype Mapping

This file maps the paper's required features and workflow to the prototype files and pages for easy demonstration during defense.

- Priority-based scheduling
  - `client/src/features/appointments/mappers.js` (priority labels, sorting)
  - `client/src/components/PriorityBadge.jsx`

- Conflict detection
  - `client/src/lib/mockStore.js` (detectConflictForLawyer)
  - `client/src/lib/mockApi.js` (/appointments/conflict-check)
  - `server/dev-server.js` (/api/appointments/conflict-check)

- Mock persistence (DB-less demo)
  - `client/src/lib/mockStore.js` (localStorage-backed store)
  - In-browser demo keys: `lfc_mock_*`

- Authentication (mock)
  - `client/src/context/AuthContext.jsx` (localStorage `lfc_user` + requestAuth wrapper)
  - Demo server cookies: `demo_user` set by `server/dev-server.js`

- Client flows
  - `client/src/pages/dashboards/ClientDashboard.jsx` (submit inquiry form, conflict-check, notifications publish)
  - `client/src/pages/Register.jsx`, `client/src/pages/Login.jsx`

- Staff & Admin flows
  - `client/src/pages/AppointmentManagement.jsx` (approve/schedule/assign/reschedule/delete)
  - `client/src/pages/dashboards/StaffDashboard.jsx`
  - `client/src/lib/mockApi.js` and `client/src/lib/mockStore.js` implement status updates and notifications

- Lawyer flows
  - `client/src/pages/dashboards/LawyerDashboard.jsx`
  - Notifications and accept endpoints in `server/dev-server.js`

- Notifications
  - `client/src/pages/Notifications.jsx`
  - `client/src/lib/mockApi.js` and `client/src/lib/mockStore.js` for in-browser notifications

- Analytics & reports (demo stubs)
  - `client/src/pages/Analytics.jsx` (summary cards)
  - `client/src/lib/mockApi.js` provides `/analytics/summary` stub

- UI and UX elements
  - `client/src/components/*` — Navbar, DashboardShell, Modal, EmptyState, StatCard
  - Loading states: `client/src/components/LoadingSkeleton.jsx`

Run checklist before defense
- Start demo server and client: `npm run dev:all`
- Run smoke script: `node scripts/smoke-demo.mjs`
- Optional: run Playwright E2E: `npm run test:e2e` (requires Playwright install and browsers)

Notes
- The prototype intentionally uses localStorage and in-memory seeding to remain DB-less for demo purposes.
- The three demo lawyers are: Elena Rivera, Victor Santos, Bianca Cruz.
- For any required change to match the paper more closely, point me to the section and I will adjust the mapping and implementation.
