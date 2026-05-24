Playwright E2E tests

Requirements:
- Node.js and npm
- From project root run tests under the `client/` workspace

Quick run (from repo root):

```bash
# install client deps
npm install --prefix client

# install Playwright browsers
npx playwright install

# run the e2e tests
npm --prefix client run test:e2e
```

Notes:
- Tests use `window.MockApi` and `window.MockStore` where possible so they run in demo/mock mode without a backend.
- If your dev server runs at a different host/port, set `BASE_URL` when running tests, e.g.: `BASE_URL=http://127.0.0.1:5173 npm --prefix client run test:e2e`.
