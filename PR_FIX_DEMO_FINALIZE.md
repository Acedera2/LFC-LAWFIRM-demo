Title: demo: finalize RBAC, cross-tab refresh, conflict UI & tests

Summary
-------
- Enforce RBAC in routes and UI (client/staff/lawyer/admin) to prevent unauthorized actions.
- Add cross-tab publish/subscribe refresh events for appointments, notifications, and users.
- Hydrate MockApi responses (appointments & notifications) with `client` and `lawyer` user summaries to simplify UI code.
- Add conflict detection UI: badges in lists/cards and a modal banner on appointment details.
- Add initial CommonJS Playwright specs under `client/tests/e2e/*.cjs` for local e2e runs.
- Minor lint fixes and safe-empty catch handling to address CI lint rules.

Files changed (high level)
-------------------------
- client/src/pages/AppointmentManagement.jsx (RBAC gating, conflict UI, action guards)
- client/src/components/AppointmentCard.jsx (conflict badge variants)
- client/src/lib/mockApi.js (hydration for appointments & notifications)
- client/src/pages/dashboards/AdminDashboard.jsx (subscribe/unsubscribe to refresh events)
- client/tests/e2e/* (access and full flow smoke tests, CommonJS)
- DEMO_CHECKLIST.md (demo run checklist)

How to review
-------------
1. Inspect the branch `fix/demo-finalize` on GitHub:
   https://github.com/Acedera2/LFC-LAWFIRM-demo/compare/main...fix/demo-finalize?expand=1
2. Use the PR body below when creating the pull request in the GitHub UI or `gh` CLI.

PR Body (copy & paste)
----------------------
Title: demo: finalize RBAC, cross-tab refresh, conflict UI & tests

This PR prepares the client-side demo for a presentation-ready flow by hardening RBAC, adding
cross-tab refresh events, improving appointment conflict UX, and adding Playwright smoke tests.

Key changes
- RBAC: route protections and UI action gating so only staff/admin can modify appointments.
- Cross-tab sync: `publishRefresh` events for `appointments:updated`, `notifications:updated`, `users:updated`.
- MockApi: hydrated appointment/notification payloads to include easy-to-consume `client` and `lawyer` objects.
- Conflict UX: badges, banner in modal, and consent flow for conflict resolution.
- Tests: initial Playwright CommonJS specs added under `client/tests/e2e`.

How to run locally (recommended sequence)
---------------------------------------
1. From repo root, install and start the client dev server:

```bash
cd client
npm install
npm run dev
```

2. In another terminal, run the Playwright smoke tests (single-worker to avoid timing noise):

```bash
# run the access test
npx --prefix client playwright test client/tests/e2e/access.spec.cjs --workers=1 --reporter=list

# run the full e2e suite
npm --prefix client run test:e2e
```

Notes
-----
- Playwright and `npm install` must be run locally — this environment could not run installs or the Playwright runner.
- The DEMO_CHECKLIST.md in the repo contains manual test steps and screenshots guidance.

If you prefer, I can open a PR draft using the `gh` CLI if you run the command below locally (it requires `gh` auth):

```bash
gh pr create --base main --head fix/demo-finalize --title "demo: finalize RBAC, cross-tab refresh, conflict UI & tests" --body-file PR_FIX_DEMO_FINALIZE.md --draft
```
