# Code Review — PR #5: Post-login home at `/main` instead of `/characters`

**Reviewed against**: `.cursor/skills/develop-base/SKILL.md`, `.cursor/skills/testing-base/SKILL.md`, `.cursor/skills/ui/SKILL.md`

**Scope**: Route rename from `/characters` to `/main` as the authenticated home. Touches `App.jsx`, `Login.jsx`, `Layout.jsx`, `CharacterForm.jsx`, `WorldDetail.jsx`, E2E fixtures, and their associated test files.

**Overall**: The change is mechanically consistent — every navigation target and assertion was updated. Backend tests (57 passed), frontend unit tests (54 passed), and ESLint all pass cleanly. No regressions detected.

---

## Top 3 Changes Needed

### 1. Add unit tests for the `/characters` → `/main` redirect (testing-base skill gap)

The PR adds `<Route path="/characters" element={<Navigate to="/main" replace />} />` for backward compatibility, but **no unit test verifies this redirect actually works**. The testing-base skill requires: *"All new/changed functionality is covered by tests"* and *"Edge cases are covered."*

Users with bookmarks or external links to `/characters` depend on this redirect. A missing or broken redirect would silently land them on the catch-all fallback instead of showing a meaningful failure. A focused test in an `App.test.jsx` (or similar) that renders the router at `/characters` and asserts the resulting location is `/main` would close this gap.

The same applies to the catch-all `<Route path="*">` redirect — it is untested.

### 2. Extract the `/main` route path into a shared constant (develop-base skill: Reuse)

The string literal `'/main'` now appears in **8+ source files** (`App.jsx`, `Login.jsx`, `Layout.jsx`, `CharacterForm.jsx`, `WorldDetail.jsx`, E2E `fixtures.js`, `auth.spec.js`, and multiple `*.test.jsx` files). The develop-base skill states: *"Search for similar logic or components before adding new ones"* and favors reuse.

A single exported constant (e.g. `export const HOME = '/main'` in a `routes.js` file) would:
- Make future renames a **one-line change** instead of a multi-file sweep.
- Eliminate the risk of a typo in one file silently breaking navigation.
- Align with the skill's minimal-diff and reuse principles.

### 3. WorldDetail test does not assert the updated "← Home" link target (testing-base skill gap)

`WorldDetail.jsx` changed its back link from `/characters` to `/main`, but `WorldDetail.test.jsx` **never asserts the `href` of the "← Home" link**. The testing-base skill requires: *"No test gaps exist for modified logic."*

If someone accidentally reverts just the `WorldDetail.jsx` link, no test would catch the regression. Adding a single assertion like `expect(screen.getByRole('link', { name: /Home/ })).toHaveAttribute('href', '/main')` would close this gap with minimal effort.

---

## Additional Observations (no immediate action required)

- **UI consistency (ui skill)**: The route rename is purely structural — no visual or layout changes. The UI skill's guidelines are not violated.
- **Backward compat**: The `/characters` and `/library` redirects preserve existing bookmarks. The `/characters` redirect is behind `ProtectedRoute`, which matches the original behavior (it was always auth-gated).
- **AGENTS.md**: Documentation was updated to reflect the new route — good.
