from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routers import auth, characters, upload, worlds

STATIC_DIR = Path(__file__).resolve().parent / "static"
(STATIC_DIR / "images").mkdir(parents=True, exist_ok=True)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Custom Ebook Webapp API")

app.include_router(auth.router)
app.include_router(worlds.router)
app.include_router(characters.router)
app.include_router(upload.router)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok"}
