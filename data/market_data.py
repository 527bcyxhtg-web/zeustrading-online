from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass(frozen=True)
class Candle:
    symbol: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int
    vwap: float
    ema_9: float
    ema_21: float
    ema_50: float
    rsi: float
    atr: float


@dataclass(frozen=True)
class Quote:
    symbol: str
    bid: float
    ask: float

    @property
    def spread_percent(self) -> float:
        mid = (self.bid + self.ask) / 2
        if mid <= 0:
            return 100.0
        return ((self.ask - self.bid) / mid) * 100


@dataclass(frozen=True)
class MarketSnapshot:
    symbol: str
    last: Candle
    previous: Candle
    quote: Quote
    relative_volume: float
    premarket_high: float
    previous_day_high: float
    previous_day_low: float
    market_bias: str


class MockMarketDataClient:
    def snapshot(self, symbol: str) -> MarketSnapshot:
        now = datetime.now(timezone.utc)
        previous = Candle(symbol, now, 166.0, 167.8, 165.7, 166.8, 850_000, 167.1, 166.6, 166.2, 165.0, 54, 1.28)
        last = Candle(symbol, now, 166.8, 168.4, 166.6, 168.2, 1_900_000, 167.4, 167.8, 166.9, 165.3, 58, 1.31)
        return MarketSnapshot(
            symbol=symbol.upper(),
            last=last,
            previous=previous,
            quote=Quote(symbol.upper(), 168.18, 168.24),
            relative_volume=2.1,
            premarket_high=168.0,
            previous_day_high=169.1,
            previous_day_low=163.4,
            market_bias="QQQ bullish, SPY stable",
        )
