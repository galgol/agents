from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.routers import upload as upload_router

from .conftest import auth_headers, register_and_login

PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
    b"\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4"
    b"\x89\x00\x00\x00\rIDATx\x9cc\xfc\xcf\xc0\x00\x00\x00\x03\x00\x01"
    b"\xa6\xa1\xb2\xab\x00\x00\x00\x00IEND\xaeB`\x82"
)

JPEG_BYTES = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xd9"
GIF_BYTES = b"GIF89a\x01\x00\x01\x00\x00\xff\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x00;"
WEBP_BYTES = b"RIFF\x1a\x00\x00\x00WEBPVP8 \x0e\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"


def test_upload_requires_auth(client: TestClient) -> None:
    r = client.post(
        "/upload",
        files={"file": ("a.png", PNG_BYTES, "image/png")},
    )
    assert r.status_code == 401


def test_upload_accepts_png_and_returns_url(client: TestClient) -> None:
    token = register_and_login(client)
    r = client.post(
        "/upload",
        files={"file": ("a.png", PNG_BYTES, "image/png")},
        headers=auth_headers(token),
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["url"].startswith("/static/images/")
    assert body["url"].endswith(".png")

    stored = upload_router.IMAGES_DIR / Path(body["url"]).name
    assert stored.exists()
    assert stored.read_bytes() == PNG_BYTES


def test_upload_rejects_unsupported_content_type(client: TestClient) -> None:
    token = register_and_login(client)
    r = client.post(
        "/upload",
        files={"file": ("evil.txt", b"hello", "text/plain")},
        headers=auth_headers(token),
    )
    assert r.status_code == 400


def test_upload_rejects_mismatched_extension(client: TestClient) -> None:
    token = register_and_login(client)
    r = client.post(
        "/upload",
        files={"file": ("a.exe", PNG_BYTES, "image/png")},
        headers=auth_headers(token),
    )
    assert r.status_code == 400


@pytest.mark.parametrize(
    "filename,content_type,payload,expected_ext",
    [
        ("a.jpg", "image/jpeg", JPEG_BYTES, ".jpg"),
        ("a.jpeg", "image/jpeg", JPEG_BYTES, ".jpeg"),
        ("a.gif", "image/gif", GIF_BYTES, ".gif"),
        ("a.webp", "image/webp", WEBP_BYTES, ".webp"),
    ],
)
def test_upload_accepts_all_allowed_types(
    client: TestClient,
    filename: str,
    content_type: str,
    payload: bytes,
    expected_ext: str,
) -> None:
    token = register_and_login(client)
    r = client.post(
        "/upload",
        files={"file": (filename, payload, content_type)},
        headers=auth_headers(token),
    )
    assert r.status_code == 201, r.text
    url = r.json()["url"]
    assert url.startswith("/static/images/")
    assert url.endswith(expected_ext)

    stored = upload_router.IMAGES_DIR / Path(url).name
    assert stored.exists()
    assert stored.read_bytes() == payload


def test_upload_rejects_extension_uppercase_when_unsupported(client: TestClient) -> None:
    token = register_and_login(client)
    r = client.post(
        "/upload",
        files={"file": ("a.bmp", b"BM", "image/bmp")},
        headers=auth_headers(token),
    )
    assert r.status_code == 400


def test_upload_accepts_uppercase_extension(client: TestClient) -> None:
    token = register_and_login(client)
    r = client.post(
        "/upload",
        files={"file": ("PHOTO.JPG", JPEG_BYTES, "image/jpeg")},
        headers=auth_headers(token),
    )
    assert r.status_code == 201, r.text
    assert r.json()["url"].endswith(".jpg")
