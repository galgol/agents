# Code Review Summary — Deploy Changeset (9919925..a752b5c)

**Reviewed commits:** 6 commits (`68e705d` → `a752b5c`)
**Files changed:** `Dockerfile` (new), `app.db`, `backend/main.py`, `frontend/src/api.js`, `frontend/src/pages/Login.jsx`, `frontend/vite.config.js`

---

## Top 3 Changes Needed

### 1. Remove `app.db` from version control

The SQLite database file (`app.db`) is tracked in git and was modified in this changeset. This is a significant issue:

- **Security risk:** The database may contain user credentials (hashed passwords) and application data that should never be in source control.
- **Not gitignored:** `.gitignore` lists `e2e-app.db` but not `app.db`.
- **Unnecessary:** Per `AGENTS.md`, the backend auto-creates the database and all tables on first startup via `Base.metadata.create_all()`. There is no reason to ship a pre-built database.

**Fix:** Add `app.db` to `.gitignore` and remove it from the repository with `git rm --cached app.db`.

---

### 2. Image URLs are broken when frontend and backend are on different origins

Components (`CharacterCard`, `WorldCard`, `ImageUpload`) render image tags with paths like `/static/images/...` relative to the current host. When deploying with `VITE_API_BASE_URL` pointing to a separate backend origin (the entire purpose of this changeset), those `<img src="/static/images/...">` tags resolve against the **frontend** host, not the API — so all images will 404 in production.

**Affected files:**
- `frontend/src/components/CharacterCard.jsx` — `<img src={character.image_url}>`
- `frontend/src/components/WorldCard.jsx` — `<img src={world.cover_image_url}>`

**Fix:** Prefix image URLs with `API_BASE` when rendering them, e.g. `` <img src={`${API_BASE}${character.image_url}`} /> ``. This keeps local dev working (where `API_BASE` is empty) and fixes production where the backend is on a different origin.

---

### 3. `Login.jsx` bypasses the shared `request()` helper — consolidate API access

`Login.jsx` makes a raw `fetch()` call with a manually assembled `${API_BASE}/auth/login` URL instead of using the centralized `api.post()` helper that already handles URL resolution, error normalization, and token-based auth headers.

**Why this matters:**
- **Duplication:** The `API_BASE` constant was exported from `api.js` solely to support this one bypass. URL resolution logic now lives in two places.
- **Inconsistent error handling:** The `request()` helper parses `detail` from error responses and throws a typed `ApiError`; the login page has its own divergent error parsing.
- **Drift risk:** Any future change to how requests are made (e.g., adding retry logic, request logging, or new headers) would need to be duplicated in `Login.jsx`.

**Fix:** Refactor the login call to use the existing `api` module. The `request()` function already prepends `API_BASE` and handles form submissions. If the OAuth2 `application/x-www-form-urlencoded` content type is the blocker, extend the `request()` helper with a small option rather than bypassing it entirely. After consolidation, `API_BASE` can be un-exported (kept module-private).

---

## Additional Observations

| Item | Severity | Detail |
|------|----------|--------|
| Dockerfile missing trailing newline | Low | `CMD` line has no final newline (`\ No newline at end of file`). Minor but fails POSIX convention. |
| CORS uses wildcard methods/headers | Medium | `allow_methods=["*"]` and `allow_headers=["*"]` is overly permissive for production. Restrict to the methods and headers actually used. |
| No test coverage for CORS middleware | Medium | The CORS addition in `main.py` has no corresponding test. Per project testing standards, all behavioral changes should be covered. |
| Commit messages are vague | Low | Messages like `f`, `f fix url bond`, `for deploy` make change history hard to follow. Use descriptive messages. |
