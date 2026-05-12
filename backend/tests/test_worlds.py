from fastapi.testclient import TestClient

from .conftest import auth_headers, register_and_login


def test_list_worlds_requires_auth(client: TestClient) -> None:
    r = client.get("/worlds")
    assert r.status_code == 401


def test_create_world_requires_auth(client: TestClient) -> None:
    r = client.post("/worlds", json={"name": "Eldoria"})
    assert r.status_code == 401


def test_create_and_list_worlds(client: TestClient) -> None:
    token = register_and_login(client)
    r = client.post(
        "/worlds",
        json={"name": "Eldoria", "description": "A magical realm", "cover_image_url": "/static/images/x.png"},
        headers=auth_headers(token),
    )
    assert r.status_code == 201
    created = r.json()
    assert created["name"] == "Eldoria"
    assert created["description"] == "A magical realm"
    assert created["cover_image_url"] == "/static/images/x.png"

    r = client.get("/worlds", headers=auth_headers(token))
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 1
    assert items[0]["id"] == created["id"]


def test_worlds_are_scoped_per_user(client: TestClient) -> None:
    alice_token = register_and_login(client, "alice", "secret123")
    bob_token = register_and_login(client, "bob", "secret123")

    client.post("/worlds", json={"name": "Alice World"}, headers=auth_headers(alice_token))
    client.post("/worlds", json={"name": "Bob World"}, headers=auth_headers(bob_token))

    alice_items = client.get("/worlds", headers=auth_headers(alice_token)).json()
    bob_items = client.get("/worlds", headers=auth_headers(bob_token)).json()

    assert [w["name"] for w in alice_items] == ["Alice World"]
    assert [w["name"] for w in bob_items] == ["Bob World"]


def test_create_world_validation_empty_name(client: TestClient) -> None:
    token = register_and_login(client)
    r = client.post("/worlds", json={"name": ""}, headers=auth_headers(token))
    assert r.status_code == 422


def test_create_world_validation_missing_name(client: TestClient) -> None:
    token = register_and_login(client)
    r = client.post("/worlds", json={"description": "no name"}, headers=auth_headers(token))
    assert r.status_code == 422


def test_create_world_validation_long_name(client: TestClient) -> None:
    token = register_and_login(client)
    r = client.post("/worlds", json={"name": "x" * 121}, headers=auth_headers(token))
    assert r.status_code == 422


def test_create_world_with_only_name_uses_null_defaults(client: TestClient) -> None:
    token = register_and_login(client)
    r = client.post("/worlds", json={"name": "Minimal"}, headers=auth_headers(token))
    assert r.status_code == 201
    body = r.json()
    assert body["name"] == "Minimal"
    assert body["description"] is None
    assert body["cover_image_url"] is None


def test_create_world_with_explicit_null_optionals(client: TestClient) -> None:
    token = register_and_login(client)
    r = client.post(
        "/worlds",
        json={"name": "Nulled", "description": None, "cover_image_url": None},
        headers=auth_headers(token),
    )
    assert r.status_code == 201
    body = r.json()
    assert body["description"] is None
    assert body["cover_image_url"] is None


def test_create_world_invalid_field_type(client: TestClient) -> None:
    token = register_and_login(client)
    r = client.post("/worlds", json={"name": 123}, headers=auth_headers(token))
    assert r.status_code == 422


def test_list_worlds_preserves_creation_order(client: TestClient) -> None:
    token = register_and_login(client)
    for name in ("Alpha", "Beta", "Gamma"):
        client.post("/worlds", json={"name": name}, headers=auth_headers(token))
    items = client.get("/worlds", headers=auth_headers(token)).json()
    assert [w["name"] for w in items] == ["Alpha", "Beta", "Gamma"]


def test_create_world_rejects_unknown_extra_fields_safely(client: TestClient) -> None:
    """Extra fields are ignored by default; ensure they do not leak into the response."""
    token = register_and_login(client)
    r = client.post(
        "/worlds",
        json={"name": "Eldoria", "secret": "should-be-ignored"},
        headers=auth_headers(token),
    )
    assert r.status_code == 201
    assert "secret" not in r.json()
