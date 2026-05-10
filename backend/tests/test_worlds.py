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
