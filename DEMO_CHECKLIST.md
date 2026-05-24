Demo checklist — LFC Lawfirm prototype

1. Core scenario (client → staff → lawyer)
   - [x] Client: register / login
   - [x] Client: submit appointment inquiry (date, type, optional lawyer)
   - [x] Staff: open Appointment Management, locate request
   - [x] Staff: approve or schedule the request
   - [x] Lawyer: assigned receives appointment in Lawyer Dashboard
   - [x] Client: sees updated status/notifications
   - [x] Cross-tab: changes in one tab reflect in other open tabs

2. Visuals & QA
   - [ ] Conflict badge visible on appointment cards and lists
   - [ ] Priority badge visible and consistent
   - [ ] Accessible labels and form validation messages

3. Tests & artifacts
   - [-] Playwright: smoke + full flow tests pass (`npm --prefix client run test:e2e`) — requires local `npm install` and Playwright browsers
   - [ ] Publish demo screenshots and short video for defense

Notes
- Run the client dev server and ensure `MockApi` is active for demo mode.

Quick local run
```
cd client
npm install
npm run dev
```

Run Playwright smoke tests (single-worker recommended):
```
npx --prefix client playwright test client/tests/e2e/access.spec.cjs --workers=1 --reporter=list
npm --prefix client run test:e2e
```

If you want me to open a PR draft for `fix/demo-finalize`, run the `gh pr create` command shown in `PR_FIX_DEMO_FINALIZE.md`.