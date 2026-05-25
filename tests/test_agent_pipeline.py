from app.config import Settings
from app.main import TradingAgent


def test_agent_scan_builds_signal_payload(tmp_path):
    settings = Settings(database_path=str(tmp_path / "agent.sqlite3"))
    payload = TradingAgent(settings).scan_symbol("AMD")

    assert payload["candidate"]["symbol"] == "AMD"
    assert payload["risk_plan"]["approved"] is True
    assert payload["order_preview"]["transmit"] is False
    assert payload["execution"]["approved"] is True
    assert "SIGNAL" in payload["explanation"]
