from __future__ import annotations

from collections.abc import Iterable


def expectancy(win_rate: float, average_win: float, average_loss: float) -> float:
    loss_rate = 1 - win_rate
    return (win_rate * average_win) - (loss_rate * average_loss)


def profit_factor(results: Iterable[float]) -> float:
    values = list(results)
    gross_profit = sum(value for value in values if value > 0)
    gross_loss = abs(sum(value for value in values if value < 0))
    if gross_loss == 0:
        return float("inf") if gross_profit > 0 else 0.0
    return gross_profit / gross_loss


def max_drawdown(equity_curve: Iterable[float]) -> float:
    values = list(equity_curve)
    if not values:
        return 0.0

    peak = values[0]
    worst = 0.0
    for value in values:
        peak = max(peak, value)
        if peak:
            worst = min(worst, (value - peak) / peak)
    return worst
