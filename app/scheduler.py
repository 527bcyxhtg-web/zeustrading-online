from __future__ import annotations

from app.main import TradingAgent


def run_premarket_plan(watchlist: list[str]) -> list[dict]:
    agent = TradingAgent()
    return [agent.scan_symbol(symbol) for symbol in watchlist]


def run_market_scan(watchlist: list[str], trades_today: int = 0, daily_pnl: float = 0.0) -> list[dict]:
    agent = TradingAgent()
    return [agent.scan_symbol(symbol, trades_today=trades_today, daily_pnl=daily_pnl) for symbol in watchlist]
