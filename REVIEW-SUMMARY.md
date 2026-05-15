# Code Review Summary — Commit `68e705d` ("for deploy")

**Reviewed file:** `Dockerfile` (new, 11 lines)

---

## Top 3 Changes Needed

### 1. Frontend Is Not Included in the Container

The project is a two-service monorepo (FastAPI backend + React/Vite frontend), but the Dockerfile only containerizes the backend. The deployed container will serve API endpoints but **not** the frontend application. A multi-stage build should be added: a first stage to `npm run build` the frontend, and a second stage that copies the built assets into the backend image so they can be served (e.g., via FastAPI's `StaticFiles` or an nginx layer).

**Affected area:** `Dockerfile` — add a Node build stage and copy `frontend/dist` into the final image.

### 2. Missing `.dockerignore` File

There is no `.dockerignore` in the repository. Without one, the entire build context — including `.git/`, `node_modules/`, `__pycache__/`, `app.db`, test artifacts, and other non-essential files — is sent to the Docker daemon on every build. This increases build time, image size, and risks leaking sensitive data into the image. A `.dockerignore` should mirror the existing `.gitignore` entries plus Docker-specific exclusions (e.g., `Dockerfile`, `.dockerignore` itself).

**Affected area:** New file `.dockerignore` at the repo root.

### 3. Missing Trailing Newline at End of File

The `Dockerfile` is missing a newline at the end of the file (`\ No newline at end of file` in the diff). This is a basic code-quality issue — POSIX text files should end with a newline. Many linters and editors flag this, and it can cause noisy diffs when a line is later appended.

**Affected area:** `Dockerfile`, line 11 — add a trailing newline after the `CMD` instruction.

---

## Additional Observations (Lower Priority)

- **Test dependencies in production image:** `requirements.txt` bundles `pytest` and `httpx` (test-only packages) alongside runtime dependencies. A production image should only install runtime requirements. Consider splitting into `requirements.txt` (runtime) and `requirements-dev.txt` (testing).
- **Ephemeral data:** SQLite (`app.db`) and uploaded images (`backend/static/images/`) are stored on-disk. In a container these are lost on restart unless a volume is mounted. The Dockerfile does not document or configure volume mounts.
- **No health check:** The backend exposes `GET /health`, but the Dockerfile does not include a `HEALTHCHECK` instruction, which would help orchestrators (Docker Compose, Kubernetes) monitor container health.
