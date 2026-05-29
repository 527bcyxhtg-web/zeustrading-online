from fastapi.testclient import TestClient

from mt5_bridge.server import GUARD_STATE_PATH, app


client = TestClient(app)


def clear_guard_state():
    if GUARD_STATE_PATH.exists():
        GUARD_STATE_PATH.unlink()


def test_health_is_available():
    clear_guard_state()
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert "version" in data
    assert "guard" in data


def test_status_alias_is_available():
    clear_guard_state()
    response = client.get("/status")
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert "version" in data


def test_guard_state_is_available():
    clear_guard_state()
    response = client.get("/guard")
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert data["guard"]["ok"] is True
    assert data["guard"]["state"]["kill_switch_active"] is False


def test_preview_blocks_missing_stop():
    clear_guard_state()
    response = client.post(
        "/order/preview",
        json={
            "exchange": "mt5-bridge",
            "mode": "protected-live",
            "symbol": "XAUUSD",
            "side": "BUY",
            "entry": 2380,
            "takeProfit": 2390,
            "quantity": 0.1,
            "approved": True,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is False
    assert any("Stop-loss" in item for item in data["blockers"])


def test_kill_switch_blocks_preview_and_can_clear():
    clear_guard_state()
    kill = client.post("/kill", json={"reason": "pytest manual stop"})
    assert kill.status_code == 200
    assert kill.json()["guard"]["state"]["kill_switch_active"] is True

    blocked = client.post(
        "/order/preview",
        json={
            "exchange": "mt5-bridge",
            "mode": "protected-live",
            "symbol": "XAUUSD",
            "side": "BUY",
            "entry": 2380,
            "stopLoss": 2375,
            "takeProfit": 2390,
            "quantity": 0.1,
            "approved": True,
        },
    )
    assert blocked.status_code == 200
    assert blocked.json()["ok"] is False
    assert any("Kill switch active" in item for item in blocked.json()["blockers"])

    cleared = client.post("/kill/clear", json={"reason": "pytest clear"})
    assert cleared.status_code == 200
    assert cleared.json()["guard"]["state"]["kill_switch_active"] is False


def test_submit_requires_approval_token():
    clear_guard_state()
    response = client.post(
        "/order/submit",
        json={
            "approvalToken": "",
            "preview": {
                "exchange": "mt5-bridge",
                "mode": "protected-live",
                "symbol": "XAUUSD",
                "side": "BUY",
                "entry": 2380,
                "stopLoss": 2375,
                "takeProfit": 2390,
                "quantity": 0.1,
                "approved": True,
            },
        },
    )
    assert response.status_code == 422


def test_dry_run_submit_records_paper_position():
    clear_guard_state()
    response = client.post(
        "/order/submit",
        json={
            "approvalToken": "pytest.manual-approval",
            "preview": {
                "exchange": "mt5-bridge",
                "mode": "protected-live",
                "symbol": "XAUUSD",
                "side": "BUY",
                "entry": 2380,
                "stopLoss": 2375,
                "takeProfit": 2390,
                "quantity": 0.1,
                "approved": True,
            },
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["dry_run"] is True
    assert data["submitted"] is False
    assert data["paper_position"]["status"] == "open"

    guard = client.get("/guard").json()["guard"]
    assert len(guard["state"]["paper_positions"]) == 1


def test_deprecated_send_order_is_blocked():
    clear_guard_state()
    response = client.post(
        "/send_order",
        json={
            "symbol": "BTCUSD",
            "action": "buy",
            "volume": 0.01,
            "sl": 65000,
            "tp": 69000,
        },
    )
    assert response.status_code == 423
    assert "Direct /send_order is blocked" in response.text
