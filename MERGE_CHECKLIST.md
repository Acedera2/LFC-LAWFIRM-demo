Merge checklist for feat/finalize-demo-login

- [ ] Confirm `npm run dev` starts both server (demo fallback) and client without errors.
- [ ] Run smoke tests:
  - `node scripts/smoke-demo-cookies.mjs`
  - `node scripts/smoke-demo.mjs`
- [ ] Verify login in browser with `admin@lfcfirm.com` / `Password123!`.
- [ ] Confirm `client/.env.local` points to correct `VITE_API_URL` if needed.
- [ ] Confirm no lint errors: `npm run lint`.
- [ ] Create PR and request review from at least one maintainer.
- [ ] Merge when CI passes (if configured) and smoke tests pass on main.
