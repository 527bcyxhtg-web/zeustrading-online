from __future__ import annotations

from app.main import TradingAgent


def load_dashboard_snapshot(symbol: str = "AMD") -> dict:
    return TradingAgent().scan_symbol(symbol)
