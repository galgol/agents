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


def test_create_character_validation_empty_name(client: TestClient) -> None:
    token = register_and_login(client)
    world_id = _create_world(client, token)
    r = client.post(
        "/characters",
        json={"world_id": world_id, "name": ""},
        headers=auth_headers(token),
    )
    assert r.status_code == 422


def test_create_character_validation_long_name(client: TestClient) -> None:
    token = register_and_login(client)
    world_id = _create_world(client, token)
    r = client.post(
        "/characters",
        json={"world_id": world_id, "name": "x" * 121},
        headers=auth_headers(token),
    )
    assert r.status_code == 422


def test_create_character_without_world_id_creates_default_world(client: TestClient) -> None:
    token = register_and_login(client)
    r = client.post("/characters", json={"name": "Aria"}, headers=auth_headers(token))
    assert r.status_code == 201
    body = r.json()
    assert body["name"] == "Aria"
    assert isinstance(body["world_id"], int)


def test_create_character_without_world_id_uses_real_default_world(client: TestClient) -> None:
    token = register_and_login(client)
    lookalike_world_id = _create_world(client, token, name="Real world")

    r = client.post("/characters", json={"name": "Aria"}, headers=auth_headers(token))
    assert r.status_code == 201
    body = r.json()
    assert body["world_id"] != lookalike_world_id

    worlds = client.get("/worlds", headers=auth_headers(token)).json()
    default_world = next(
        (world for world in worlds if world["description"] == "A basic real-world setting."),
        None,
    )
    assert default_world is not None
    assert default_world["id"] == body["world_id"]


def test_create_character_validation_missing_name(client: TestClient) -> None:
    token = register_and_login(client)
    world_id = _create_world(client, token)
    r = client.post(
        "/characters",
        json={"world_id": world_id},
        headers=auth_headers(token),
    )
    assert r.status_code == 422


def test_create_character_validation_world_id_wrong_type(client: TestClient) -> None:
    token = register_and_login(client)
    r = client.post(
        "/characters",
        json={"world_id": "not-an-int", "name": "Aria"},
        headers=auth_headers(token),
    )
    assert r.status_code == 422


def test_create_character_with_only_required_fields_has_null_optionals(client: TestClient) -> None:
    token = register_and_login(client)
    world_id = _create_world(client, token)
    r = client.post(
        "/characters",
        json={"world_id": world_id, "name": "Minimal"},
        headers=auth_headers(token),
    )
    assert r.status_code == 201
    body = r.json()
    assert body["bio"] is None
    assert body["traits"] is None
    assert body["image_url"] is None
    assert body["age"] is None
    assert body["gender"] is None
    assert body["hair"] is None
    assert body["eyes"] is None
    assert body["height"] is None
    assert body["body_figure"] is None
    assert body["characteristics"] is None


def test_list_characters_without_world_id_returns_all_for_user(client: TestClient) -> None:
    token = register_and_login(client)
    w1 = _create_world(client, token, name="One")
    w2 = _create_world(client, token, name="Two")
    client.post("/characters", json={"world_id": w1, "name": "Aria"}, headers=auth_headers(token))
    client.post("/characters", json={"world_id": w2, "name": "Borin"}, headers=auth_headers(token))

    r = client.get("/characters", headers=auth_headers(token))
    assert r.status_code == 200
    names = [c["name"] for c in r.json()]
    assert names == ["Aria", "Borin"]


def test_create_character_with_appearance_fields(client: TestClient) -> None:
    token = register_and_login(client)
    world_id = _create_world(client, token)
    r = client.post(
        "/characters",
        json={
            "world_id": world_id,
            "name": "Aria",
            "age": 28,
            "gender": "woman",
            "hair": "black, long",
            "eyes": "green",
            "height": "170 cm",
            "body_figure": "athletic",
            "characteristics": "Curious, stubborn, kind",
        },
        headers=auth_headers(token),
    )
    assert r.status_code == 201
    body = r.json()
    assert body["age"] == 28
    assert body["gender"] == "woman"
    assert body["hair"] == "black, long"
    assert body["eyes"] == "green"
    assert body["height"] == "170 cm"
    assert body["body_figure"] == "athletic"
    assert body["characteristics"] == "Curious, stubborn, kind"

    r2 = client.get(f"/characters/{body['id']}", headers=auth_headers(token))
    assert r2.status_code == 200
    assert r2.json() == body


def test_create_character_validation_age_negative(client: TestClient) -> None:
    token = register_and_login(client)
    world_id = _create_world(client, token)
    r = client.post(
        "/characters",
        json={"world_id": world_id, "name": "X", "age": -1},
        headers=auth_headers(token),
    )
    assert r.status_code == 422


def test_cannot_create_character_in_another_users_world(client: TestClient) -> None:
    alice_token = register_and_login(client, "alice", "secret123")
    bob_token = register_and_login(client, "bob", "secret123")
    alice_world = _create_world(client, alice_token, "Alice World")

    r = client.post(
        "/characters",
        json={"world_id": alice_world, "name": "Intruder"},
        headers=auth_headers(bob_token),
    )
    assert r.status_code == 404
