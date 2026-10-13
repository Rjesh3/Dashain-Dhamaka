import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./dashain_test.db")

from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, engine, init_db

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
init_db()

client = TestClient(app)


def reset_state():
    client.cookies.clear()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    init_db()


def test_session_and_spin_flow():
    reset_state()
    response = client.post("/v1/sessions", json={"locale": "en"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["state"]["spins_remaining"] is None
    assert payload["state"]["spin_limit"] is None
    assert payload["state"]["points"] == 0

    headers = {"Idempotency-Key": "11111111-1111-4111-8111-111111111111"}
    spin = client.post("/v1/spins", headers=headers)
    assert spin.status_code == 200
    assert spin.json()["spin"]["replayed"] is False

    second = client.post("/v1/spins", headers={"Idempotency-Key": "22222222-2222-4222-8222-222222222222"})
    assert second.status_code == 200

    for i in range(10):
        resp = client.post("/v1/spins", headers={"Idempotency-Key": f"{i}3333333-3333-4333-8333-{i:012d}"})
        assert resp.status_code == 200
    assert resp.json()["state"]["spins_used"] == 12
    assert resp.json()["state"]["spins_remaining"] is None


def test_duplicate_spin_is_replayed():
    reset_state()
    response = client.post("/v1/sessions", json={"locale": "ne"})
    token = response.cookies.get("session_token")
    headers = {"Idempotency-Key": "55555555-5555-4555-8555-555555555555"}
    first = client.post("/v1/spins", headers=headers, cookies={"session_token": token})
    second = client.post("/v1/spins", headers=headers, cookies={"session_token": token})
    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["spin"]["points_awarded"] == second.json()["spin"]["points_awarded"]
    assert first.json()["spin"]["id"] == second.json()["spin"]["id"]


def test_probability_summary_matches_spec():
    reset_state()
    outcomes = [10, 100, 200, 500, 700, 1000, 10000]
    weight_values = [3000, 2500, 2000, 1200, 700, 560, 40]
    total = sum(weight_values)
    assert total == 10000
    expected = sum(points * weight / total for points, weight in zip(outcomes, weight_values))
    assert abs(expected - 273.0) < 0.000001
