from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SignalCandidate:
    symbol: str
    direction: str
    setup: str
    entry: float
    stop_loss: float
    target: float
    confidence: int
    reason: str
    invalidation: str
    volume_relative: float
    rsi: float
    spread_percent: float
    market_context: str
    news_risk: str
