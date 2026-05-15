# Code Review Summary

**Reviewed against:** `.cursor/skills/develop-base/SKILL.md`, `.cursor/skills/testing-base/SKILL.md`, `.cursor/skills/ui/SKILL.md`

**Trigger:** Push `48c45a9` — adds `preview.allowedHosts` to `vite.config.js`

---

## Top 3 Changes Needed

### 1. Add `GET /worlds/{id}` backend route (Architectural Gap)

**Skill violated:** *focused-code* — "Keep boundaries honest"; *pre-commit-test-agent* — "No regressions detected"

`WorldDetail.jsx` calls `api.get(/worlds/${id})` but the backend only implements `GET /worlds` (list) and `POST /worlds` (create). There is no single-world endpoint. As a result, the world detail page **never** displays the world's actual title or description — it always falls back to a generic "World" heading. The frontend test (`WorldDetail.test.jsx`) mocks this fetch as a 404, encoding the bug rather than catching it.

**Fix:** Add `GET /worlds/{world_id}` to `backend/routers/worlds.py` with ownership validation, update `WorldDetail.jsx` to use the response, and fix the frontend test to mock a successful world fetch.

---

### 2. Close test coverage gaps for upload and validation edge cases (Testing Gap)

**Skill violated:** *pre-commit-test-agent* — "Edge cases are covered"; Known Coverage Gaps section

Several testing gaps exist:

- **Upload router** allows JPEG, GIF, and WebP (`ALLOWED_CONTENT_TYPES` / `ALLOWED_EXTENSIONS`), but tests only exercise PNG uploads. No test verifies these other accepted formats, and no test confirms behavior with oversized files (the handler calls `await file.read()` with no size cap).
- **Frontend CI** (`frontend.yml`) runs `npm test` (Vitest) but does **not** run `npm run lint` (ESLint), so lint regressions can merge undetected.
- **Backend CI** (`manual.yml`) starts a uvicorn server in the background before running `pytest`, but the test suite uses `httpx.TestClient` and does not need a running server — this is unnecessary complexity that could mask test isolation issues.

**Fix:** Add upload tests for JPEG/GIF/WebP and an oversized-file test; add `npm run lint` step to `frontend.yml`; remove the unnecessary uvicorn startup from `manual.yml`.

---

### 3. Fix `navigate` during render in `Login.jsx` (Code Quality / UI)

**Skill violated:** *focused-code* — "Match the codebase" (React best practices); *frontend-apple-design-agent* — "No redundant elements"

In `Login.jsx`, when the user is already authenticated, `navigate(from, { replace: true })` is called directly during the render phase (outside of `useEffect`). While React 19 may tolerate this, it violates React's expected side-effect model, can cause double-navigation in `StrictMode`, and is inconsistent with how other route guards (e.g., `ProtectedRoute.jsx`) handle redirects.

**Fix:** Wrap the authenticated-redirect logic in a `useEffect` or return a `<Navigate>` component (matching the pattern already used in `ProtectedRoute.jsx`).

---

## Additional Observations (Lower Priority)

| Area | Finding |
|------|---------|
| **Security** | Default `SECRET_KEY = "dev-secret-change-me"` in `security.py` if env unset; upload trusts client `Content-Type` without magic-byte validation; no file size limit. |
| **UI/UX** | `CharacterForm.jsx` silently converts non-numeric age to `null` instead of showing a validation error; world detail page is functionally broken (see item 1). |
| **Config** | `manual.yml` filename does not match its workflow name ("backend Tests"); e2e workflow only triggers on `main`/`master`, skipping feature branch validation. |
