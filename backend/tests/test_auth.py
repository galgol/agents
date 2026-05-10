from fastapi.testclient import TestClient


def test_register_success(client: TestClient) -> None:
    r = client.post("/auth/register", json={"username": "alice", "password": "secret123"})
    assert r.status_code == 201
    body = r.json()
    assert body["username"] == "alice"
    assert "id" in body
    assert "hashed_password" not in body


def test_register_duplicate_username(client: TestClient) -> None:
    payload = {"username": "alice", "password": "secret123"}
    assert client.post("/auth/register", json=payload).status_code == 201
    r = client.post("/auth/register", json=payload)
    assert r.status_code == 400
    assert "already taken" in r.json()["detail"].lower()


def test_login_success_returns_jwt(client: TestClient) -> None:
    client.post("/auth/register", json={"username": "alice", "password": "secret123"})
    r = client.post("/auth/login", data={"username": "alice", "password": "secret123"})
    assert r.status_code == 200
    body = r.json()
    assert body["token_type"] == "bearer"
    assert isinstance(body["access_token"], str) and body["access_token"]


def test_login_wrong_password(client: TestClient) -> None:
    client.post("/auth/register", json={"username": "alice", "password": "secret123"})
    r = client.post("/auth/login", data={"username": "alice", "password": "wrong"})
    assert r.status_code == 401


def test_login_unknown_user(client: TestClient) -> None:
    r = client.post("/auth/login", data={"username": "ghost", "password": "secret123"})
    assert r.status_code == 401


def test_register_validation_short_password(client: TestClient) -> None:
    r = client.post("/auth/register", json={"username": "alice", "password": "x"})
    assert r.status_code == 422
