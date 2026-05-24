Demo run instructions — LFC Legal Appointment System

Quick start (dev, mock/demo mode):

1. From repo root, run the client dev server:

```bash
npm --prefix client install
npm --prefix client run dev
```

2. Open the app in a browser:

```
http://127.0.0.1:5174
```

Notes:
- The client defaults to demo/mock mode (no backend) when `VITE_API_URL` is empty. Mock data and session are stored in `localStorage` under `lfc_mock_*` and `lfc_user` keys.
- Seed demo accounts (all use `Password123!`):
  - admin@demo.local (Admin)
  - staff@demo.local (Staff)
  - elena.rivera@demo.local (Lawyer)
  - client@demo.local (Client)

Production preview (static build):

```bash
npm --prefix client run build
npm --prefix client run preview
```

Playwright E2E (local):

```bash
npm install --prefix client
npx playwright install
npm --prefix client run test:e2e
```

CI: A GitHub Actions workflow `.github/workflows/e2e.yml` is included to run Playwright on pushes and pull requests to `main`.

If you want, I can also:
- Add screenshot assets for the README and a short demo script for presenting the app.
- Run Playwright tests here if you enable npm access in this environment.
