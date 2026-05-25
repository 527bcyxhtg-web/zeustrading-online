from __future__ import annotations

from data.market_data import MarketSnapshot
from strategies.base_strategy import SignalCandidate


def generate_opening_range_breakout_signal(snapshot: MarketSnapshot, news_risk: str = "low") -> SignalCandidate | None:
    last = snapshot.last
    broke_premarket_high = last.close > snapshot.premarket_high
    volume_ok = snapshot.relative_volume >= 1.8
    rsi_ok = last.rsi < 72

    if not (broke_premarket_high and volume_ok and rsi_ok):
        return None

    entry = last.close
    stop = snapshot.premarket_high - (last.atr * 0.35)
    risk = entry - stop
    target = entry + risk * 2

    return SignalCandidate(
        symbol=snapshot.symbol,
        direction="LONG",
        setup="Opening range breakout above premarket high",
        entry=round(entry, 2),
        stop_loss=round(stop, 2),
        target=round(target, 2),
        confidence=70,
        reason="Price broke premarket high with elevated relative volume and acceptable RSI.",
        invalidation="Close back inside the opening range.",
        volume_relative=snapshot.relative_volume,
        rsi=last.rsi,
        spread_percent=snapshot.quote.spread_percent,
        market_context=snapshot.market_bias,
        news_risk=news_risk,
    )
