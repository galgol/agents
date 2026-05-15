# Code Review Summary — Commit `8cc5a46` ("f fix url bond")

**File changed:** `frontend/src/pages/Login.jsx` (2 lines)

**Intent:** Prefix the login `fetch()` call with `API_BASE` so the URL resolves correctly when deployed behind a non-root base path.

---

## Top 3 Changes Needed

### 1. Critical Bug — `API_BASE` is not exported from `api.js`

`Login.jsx` now imports `{ API_BASE }` from `../api.js`, but `api.js` declares it as a **private** `const` (line 3: `const API_BASE = ...`), not `export const`. As a result, `API_BASE` resolves to `undefined` at runtime, producing the broken URL `undefined/auth/login`.

The test suite confirms this failure:

```
AssertionError: expected 'undefined/auth/login' to be '/auth/login'
```

**Fix:** Either add `export` to the `API_BASE` declaration in `api.js`, or (preferred) stop importing it directly — see point 2 below.

### 2. Design Issue — Bypasses the centralized `request()` helper (violates Reuse principle)

`api.js` already provides a `request()` function that prepends `API_BASE`, attaches the auth token, and handles errors uniformly. Every other page (`Library`, `CharacterForm`, `WorldDetail`, `ImageUpload`) uses the `api.get()` / `api.post()` / `api.upload()` wrappers.

`Login.jsx` instead calls `fetch()` directly and manually prepends `API_BASE`, duplicating URL-construction logic and skipping centralized error handling. Per the focused-code skill: *"Reuse: Search for similar logic or components before adding new ones."*

**Fix:** Extend the `api` module to support form-encoded POST (e.g. add an `api.formPost()` method), then call it from `Login.jsx` instead of raw `fetch()`. This keeps URL handling in one place and avoids leaking the internal `API_BASE` constant.

### 3. Test Gap — `Login.test.jsx` not updated for the URL change

`Login.test.jsx` line 56 asserts `expect(url).toBe('/auth/login')`. After the change, the actual URL is `${API_BASE}/auth/login`. The test now **fails** (as shown above). Even if the export bug in point 1 were fixed, the test would only pass coincidentally (because `VITE_API_BASE_URL` is unset in tests, making `API_BASE` an empty string). The test does not validate the actual `API_BASE`-prefixed behavior.

**Fix:** If sticking with direct `fetch()`, update the test to assert the URL includes the `API_BASE` prefix. If switching to the `api` module (recommended per point 2), the test should mock `api.formPost()` instead of `fetch()` directly, matching the pattern used in other test files.
