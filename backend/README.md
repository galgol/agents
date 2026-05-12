# Custom Ebook Webapp - Backend

FastAPI + SQLite backend for the Custom Ebook Webapp.

## Setup

```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate   # PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run

```bash
uvicorn backend.main:app --reload
```

The API will be available at `http://localhost:8000` and interactive docs at `http://localhost:8000/docs`.

Static images are served from `/static/images/`.

## Environment

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///./app.db` | SQLAlchemy database URL |
| `SECRET_KEY` | `dev-secret-change-me` | JWT signing secret (override in production) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | JWT lifetime in minutes |

## Tests

From the repo root:

```bash
python -m pytest backend/tests
```

Tests use an in-memory SQLite database and an isolated static upload directory (see `backend/tests/conftest.py`); no running server is required.
