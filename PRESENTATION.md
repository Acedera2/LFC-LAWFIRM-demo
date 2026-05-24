Presentation script and slide outline — LFC Legal Appointment System

Title: LFC Legal — Demo: Conflict-aware scheduling for legal teams
Duration: 7-10 minutes

Slide 1 — Title (20s)
- Title: LFC Legal Appointment System
- Subtitle: Demo prototype — DB-less demo mode, role-based dashboards, conflict checks
- Speaker: Short greeting, one-sentence value prop: "Shows how our prototype prevents scheduling conflicts and gives role-specific visibility."

Slide 2 — Architecture (40s)
- Bullets: Frontend React + Vite; MockApi + MockStore for demo mode (localStorage); Optional Express server for production.
- Callout: Demo mode requires no backend — works offline in browser.

Slide 3 — Quick tour (2:00)
- Show login page, demo account buttons (Admin, Staff, Lawyer, Client)
- Action: Click Admin > land on Admin dashboard
- Speaker: "Admin sees system overview, conflict alerts, and quick actions."

Slide 4 — Role dashboards (2:00)
- Show Staff dashboard and Lawyer dashboard
- Highlight: Appointments list, conflict indicators, assign/accept flows
- Speaker: "Each role sees tailored workflows and can act without noisy permissions."

Slide 5 — Appointment lifecycle & conflict check (1:30)
- Demonstrate creating an appointment and show conflict detection (MockStore runs instantly)
- Speaker: "Conflict check is deterministic and visible on creation — no backend needed."

Slide 6 — Demo resiliency & tests (40s)
- Mention Playwright E2E tests included, CI workflow, artifact capture (screenshots, traces) for debugging
- Speaker: "We added automated tests so the demo behaves reliably during presentations."

Slide 7 — How to run (20s)
- Commands (brief): dev server, build, run tests
- Link to `DEMO_RUN.md` in repo

Slide 8 — Next steps / Q&A (30s)
- Options: Wire real backend, extend analytics, multi-tenant support, or prepare a hosted demo.

Speaker script tips
- Keep actions minimal: log in, show dashboards, create a single appointment, show conflict, open clients view.
- If offline, use the seeded demo accounts; all use `Password123!`.
- Mention that tests and CI artifacts help recover from unexpected failures during the demo.

Assets
- Screenshot files: `client/demo/*.png` (generate via `npm run e2e:screenshots`)
- Playwright report: `client/playwright-report` (CI artifact)

Notes for presenter
- If a page appears blank, refresh the page and ensure `localStorage.lfc_user` is set (open devtools and run: `localStorage.setItem('lfc_user', JSON.stringify({ user: { id: 'user_admin', name: 'Ariana Cruz', role: { slug: 'admin' } } })); location.reload();`)

