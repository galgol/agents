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


def test_register_validation_short_username(client: TestClient) -> None:
    r = client.post("/auth/register", json={"username": "ab", "password": "secret123"})
    assert r.status_code == 422


def test_register_validation_long_username(client: TestClient) -> None:
    r = client.post("/auth/register", json={"username": "a" * 65, "password": "secret123"})
    assert r.status_code == 422


def test_register_validation_long_password(client: TestClient) -> None:
    r = client.post("/auth/register", json={"username": "alice", "password": "p" * 129})
    assert r.status_code == 422


def test_register_validation_missing_username(client: TestClient) -> None:
    r = client.post("/auth/register", json={"password": "secret123"})
    assert r.status_code == 422


def test_register_validation_missing_password(client: TestClient) -> None:
    r = client.post("/auth/register", json={"username": "alice"})
    assert r.status_code == 422


def test_register_validation_wrong_field_types(client: TestClient) -> None:
    r = client.post("/auth/register", json={"username": 123, "password": ["x"]})
    assert r.status_code == 422


def test_register_validation_empty_body(client: TestClient) -> None:
    r = client.post("/auth/register", json={})
    assert r.status_code == 422


def test_login_missing_credentials(client: TestClient) -> None:
    r = client.post("/auth/login", data={})
    assert r.status_code == 422


def test_login_wrong_password_includes_www_authenticate_header(client: TestClient) -> None:
    client.post("/auth/register", json={"username": "alice", "password": "secret123"})
    r = client.post("/auth/login", data={"username": "alice", "password": "wrong"})
    assert r.status_code == 401
    assert r.headers.get("WWW-Authenticate") == "Bearer"


def test_protected_route_with_invalid_token(client: TestClient) -> None:
    r = client.get("/worlds", headers={"Authorization": "Bearer not-a-real-token"})
    assert r.status_code == 401


def test_protected_route_with_malformed_auth_header(client: TestClient) -> None:
    r = client.get("/worlds", headers={"Authorization": "Token abc"})
    assert r.status_code == 401
