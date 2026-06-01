# Code Review: PR #25 — Fix home icon behavior when already on main route

## Summary of Change

The PR modifies `Layout.jsx` to dynamically set the home icon's `Link` target: when the user is already on `/main`, it links to `/` instead. Otherwise it links to `/main`. A corresponding test was added.

---

## Top 3 Changes Needed

### 1. Navigation to `/` is a dead-end redirect (Bug / UX)

**Skill violated**: `develop-base/SKILL.md` — "Single path: prefer one clear code path over many branches for hypothetical cases"  
**Skill violated**: `ui/SKILL.md` — "Every UI element must have a purpose"

`App.jsx` has no explicit route for `/`. The catch-all (`<Route path="*" .../>`) redirects any unmatched path back to `/main`. So clicking "Home" on `/main` triggers: `/main` → `/` → catch-all redirect → `/main`. The user ends up exactly where they started, but with an unnecessary navigation cycle (React Router state change + re-render).

**Fix**: Either introduce a meaningful destination for `/` (e.g. a landing/dashboard), or change the behavior to something useful when already home — such as disabling/hiding the link, scrolling to top, or simply keeping the link pointing to `/main` (a harmless identity navigation that avoids the redirect hop).

---

### 2. Strict string equality on `location.pathname` misses sub-paths and query params (Robustness)

**Skill violated**: `testing-base/SKILL.md` — "Actively identify edge cases: boundary values, unexpected user input"

The condition `location.pathname === '/main'` only matches the exact string `/main`. It won't match `/main/` (trailing slash) or any nested routes under `/main` if they're added later. This is fragile.

**Fix**: Use `location.pathname.startsWith('/main')` or normalize the pathname before comparison to make the logic more resilient to routing changes.

---

### 3. Test does not verify the actual user-facing outcome of the `/` link (Test Gap)

**Skill violated**: `testing-base/SKILL.md` — "Prefer meaningful assertions over superficial coverage"; "Tests must validate behavior, not implementation details"

The new test checks that `homeLink` has `href="/"`, but does not verify what happens when the user clicks it. Since `/` redirects back to `/main` via the catch-all, the test should assert the end-state after navigation (user lands back on `/main` or sees expected content). Currently it only validates the intermediate `href` attribute — an implementation detail — rather than the actual behavior.

**Fix**: Add a click interaction in the test and assert on the resulting rendered content/route, similar to how the sign-out test verifies navigation to the login page.

---

## Additional Observations

- The diff is minimal and well-scoped (2 files, 14 lines) — good adherence to "minimal diff" principle.
- The test file correctly adds a `/world/:id` route stub to cover the non-home case — good practice.
- Lint and all 63 tests pass.
