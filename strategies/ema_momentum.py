from __future__ import annotations

from data.market_data import MarketSnapshot
from strategies.base_strategy import SignalCandidate


def generate_ema_momentum_signal(snapshot: MarketSnapshot, news_risk: str = "low") -> SignalCandidate | None:
    last = snapshot.last
    quote = snapshot.quote
    trend_ok = last.close > last.vwap and last.ema_9 > last.ema_21 > last.ema_50
    volume_ok = snapshot.relative_volume >= 1.5
    rsi_ok = 45 <= last.rsi <= 70

    if not (trend_ok and volume_ok and rsi_ok):
        return None

    entry = last.close
    stop = min(last.vwap, last.low)
    risk = entry - stop
    target = entry + risk * 2

    return SignalCandidate(
        symbol=snapshot.symbol,
        direction="LONG",
        setup="EMA 9/21 continuation above VWAP",
        entry=round(entry, 2),
        stop_loss=round(stop, 2),
        target=round(target, 2),
        confidence=74,
        reason="Price is above VWAP with EMA 9 > EMA 21 > EMA 50 and confirmed relative volume.",
        invalidation="Close below VWAP or EMA 21 on the active timeframe.",
        volume_relative=snapshot.relative_volume,
        rsi=last.rsi,
        spread_percent=quote.spread_percent,
        market_context=snapshot.market_bias,
        news_risk=news_risk,
    )
