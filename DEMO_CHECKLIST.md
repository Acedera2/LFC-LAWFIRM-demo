Demo checklist — LFC Lawfirm prototype

1. Core scenario (client → staff → lawyer)
   - [ ] Client: register / login
   - [ ] Client: submit appointment inquiry (date, type, optional lawyer)
   - [ ] Staff: open Appointment Management, locate request
   - [ ] Staff: approve or schedule the request
   - [ ] Lawyer: assigned receives appointment in Lawyer Dashboard
   - [ ] Client: sees updated status/notifications
   - [ ] Cross-tab: changes in one tab reflect in other open tabs

2. Visuals & QA
   - [ ] Conflict badge visible on appointment cards and lists
   - [ ] Priority badge visible and consistent
   - [ ] Accessible labels and form validation messages

3. Tests & artifacts
   - [ ] Playwright: smoke + full flow tests pass (`npm --prefix client run test:e2e`)
   - [ ] Publish demo screenshots and short video for defense

Notes
- Run the client dev server and ensure `MockApi` is active for demo mode.