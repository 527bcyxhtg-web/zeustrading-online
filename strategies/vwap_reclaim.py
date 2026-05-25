from __future__ import annotations

from typing import Any

import pandas as pd


def generate_vwap_reclaim_signal(df: pd.DataFrame, symbol: str = "UNKNOWN") -> dict[str, Any] | None:
    required = {"open", "high", "low", "close", "volume", "vwap", "ema_9", "ema_21", "rsi"}
    missing = required.difference(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {', '.join(sorted(missing))}")

    if len(df) < 30:
        return None

    last = df.iloc[-1]
    prev = df.iloc[-2]

    volume_avg = df["volume"].tail(20).mean()
    volume_spike = last["volume"] > volume_avg * 1.5
    reclaimed_vwap = prev["close"] < prev["vwap"] and last["close"] > last["vwap"]
    ema_bullish = last["ema_9"] > last["ema_21"]
    rsi_ok = 45 <= last["rsi"] <= 70

    if reclaimed_vwap and ema_bullish and volume_spike and rsi_ok:
        entry = float(last["close"])
        stop_loss = float(min(last["vwap"], last["low"]) * 0.997)
        risk = entry - stop_loss
        target = entry + risk * 2

        return {
            "symbol": symbol.upper(),
            "direction": "LONG",
            "setup": "VWAP reclaim + EMA momentum + volume spike",
            "entry": round(entry, 2),
            "stop_loss": round(stop_loss, 2),
            "target": round(target, 2),
            "volume_relative": round(float(last["volume"] / volume_avg), 2),
            "rsi": round(float(last["rsi"]), 1),
        }

    return None
