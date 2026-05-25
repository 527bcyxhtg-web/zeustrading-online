from __future__ import annotations

from risk.risk_manager import TradePlan


def explain_trade_plan(
    plan: TradePlan,
    setup: str,
    market_context: str,
    news_risk: str,
    volume_relative: float | None = None,
    rsi: float | None = None,
) -> str:
    if not plan.approved:
        return f"NO TRADE: {plan.symbol} {plan.direction}. Reason: {plan.reason}"

    details = [
        f"SIGNAL: {plan.symbol} {plan.direction}",
        f"Setup: {setup}",
        f"Entry: {plan.entry:.2f}",
        f"Stop: {plan.stop_loss:.2f}",
        f"Target: {plan.target:.2f}",
        f"Position size: {plan.position_size}",
        f"Risk: {plan.risk_amount:.2f}",
        f"R:R: 1:{plan.reward_risk:.2f}",
        f"Market context: {market_context}",
        f"News risk: {news_risk}",
    ]

    if volume_relative is not None:
        details.append(f"Relative volume: {volume_relative:.2f}x")
    if rsi is not None:
        details.append(f"RSI: {rsi:.1f}")

    details.append("Invalidation: setup is invalid if price closes back through the planned structure/VWAP.")
    details.append("Action: manual confirmation required before paper order.")
    return "\n".join(details)
