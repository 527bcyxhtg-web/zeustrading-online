from fastapi.testclient import TestClient

from mt5_bridge.server import app


client = TestClient(app)


def test_health_is_available():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert "version" in data


def test_status_alias_is_available():
    response = client.get("/status")
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert "version" in data


def test_preview_blocks_missing_stop():
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


def test_submit_requires_approval_token():
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


def test_deprecated_send_order_is_blocked():
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
