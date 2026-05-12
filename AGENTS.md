## Cursor Cloud specific instructions

### Overview

This is a two-service monorepo: a **FastAPI backend** (Python) and a **React + Vite frontend** (JavaScript). SQLite is the default database (file-based, no external process). See `backend/README.md` and `frontend/README.md` for standard commands.

### Running Services

| Service | Command | Port | Working Directory |
|---------|---------|------|-------------------|
| Backend | `uvicorn backend.main:app --reload` | 8000 | `/workspace` (repo root) |
| Frontend | `npm run dev` | 5173 | `/workspace/frontend` |

The backend must be started from the repo root so that `backend.main:app` resolves correctly. The Vite dev server proxies `/auth`, `/worlds`, `/characters`, `/upload`, and `/static` to `http://localhost:8000`.

### Testing

- **Backend tests**: `python3 -m pytest backend/tests` (from repo root). The CI workflow starts the backend server before running tests, but the test suite uses `httpx` with `TestClient` so a running server is **not** required for `pytest`.
- **Frontend lint**: `npm run lint` (from `frontend/`).

### Gotchas

- `pytest` may not be on `PATH` after `pip install`; use `python3 -m pytest` instead.
- The backend auto-creates the SQLite database (`app.db`) and all tables on first startup via `Base.metadata.create_all()`. No migrations needed.
- The frontend has no registration page in the UI; account creation is done via `POST /auth/register` API endpoint (JSON body: `{"username":"...","password":"..."}`).
- The `passlib` library emits a `DeprecationWarning` about `crypt` on Python 3.12+; this is harmless.
