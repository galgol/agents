from fastapi.testclient import TestClient

from .conftest import auth_headers, register_and_login


def _create_world(client: TestClient, token: str, name: str = "Eldoria") -> int:
    r = client.post("/worlds", json={"name": name}, headers=auth_headers(token))
    assert r.status_code == 201
    return r.json()["id"]


def test_characters_require_auth(client: TestClient) -> None:
    assert client.get("/characters?world_id=1").status_code == 401
    assert client.post("/characters", json={"world_id": 1, "name": "Aria"}).status_code == 401
    assert client.get("/characters/1").status_code == 401


def test_create_character_and_fetch_by_id(client: TestClient) -> None:
    token = register_and_login(client)
    world_id = _create_world(client, token)

    r = client.post(
        "/characters",
        json={
            "world_id": world_id,
            "name": "Aria",
            "bio": "A brave knight",
            "traits": "loyal,strong",
            "image_url": "/static/images/a.png",
        },
        headers=auth_headers(token),
    )
    assert r.status_code == 201
    created = r.json()
    assert created["world_id"] == world_id
    assert created["name"] == "Aria"

    r = client.get(f"/characters/{created['id']}", headers=auth_headers(token))
    assert r.status_code == 200
    assert r.json() == created


def test_list_characters_by_world(client: TestClient) -> None:
    token = register_and_login(client)
    world_id = _create_world(client, token)
    other_world_id = _create_world(client, token, name="Other")

    client.post("/characters", json={"world_id": world_id, "name": "Aria"}, headers=auth_headers(token))
    client.post("/characters", json={"world_id": world_id, "name": "Borin"}, headers=auth_headers(token))
    client.post("/characters", json={"world_id": other_world_id, "name": "Stranger"}, headers=auth_headers(token))

    r = client.get(f"/characters?world_id={world_id}", headers=auth_headers(token))
    assert r.status_code == 200
    names = [c["name"] for c in r.json()]
    assert names == ["Aria", "Borin"]


def test_create_character_in_unknown_world(client: TestClient) -> None:
    token = register_and_login(client)
    r = client.post(
        "/characters",
        json={"world_id": 9999, "name": "Ghost"},
        headers=auth_headers(token),
    )
    assert r.status_code == 404


def test_cannot_access_other_users_character(client: TestClient) -> None:
    alice_token = register_and_login(client, "alice", "secret123")
    bob_token = register_and_login(client, "bob", "secret123")

    alice_world = _create_world(client, alice_token, "Alice World")
    r = client.post(
        "/characters",
        json={"world_id": alice_world, "name": "Aria"},
        headers=auth_headers(alice_token),
    )
    char_id = r.json()["id"]

    assert client.get(f"/characters/{char_id}", headers=auth_headers(bob_token)).status_code == 404
    assert client.get(f"/characters?world_id={alice_world}", headers=auth_headers(bob_token)).status_code == 404


def test_get_unknown_character_returns_404(client: TestClient) -> None:
    token = register_and_login(client)
    r = client.get("/characters/9999", headers=auth_headers(token))
    assert r.status_code == 404
