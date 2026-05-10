import shutil
import tempfile
from pathlib import Path
from typing import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend import database, main
from backend.database import Base, get_db
from backend.routers import upload as upload_router


@pytest.fixture()
def tmp_static_dir() -> Iterator[Path]:
    tmp = Path(tempfile.mkdtemp(prefix="ebook-static-"))
    (tmp / "images").mkdir(parents=True, exist_ok=True)
    yield tmp
    shutil.rmtree(tmp, ignore_errors=True)


@pytest.fixture()
def client(tmp_static_dir: Path) -> Iterator[TestClient]:
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    TestingSessionLocal = sessionmaker(bind=test_engine, autoflush=False, autocommit=False, future=True)
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    main.app.dependency_overrides[get_db] = override_get_db

    original_images_dir = upload_router.IMAGES_DIR
    upload_router.IMAGES_DIR = tmp_static_dir / "images"

    with TestClient(main.app) as c:
        yield c

    main.app.dependency_overrides.clear()
    upload_router.IMAGES_DIR = original_images_dir
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()


def register_and_login(client: TestClient, username: str = "alice", password: str = "secret123") -> str:
    r = client.post("/auth/register", json={"username": username, "password": password})
    assert r.status_code == 201, r.text
    r = client.post("/auth/login", data={"username": username, "password": password})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}
