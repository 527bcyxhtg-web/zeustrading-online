from __future__ import annotations

from dataclasses import dataclass

from backtesting.metrics import expectancy, max_drawdown, profit_factor


@dataclass(frozen=True)
class BacktestResult:
    trades: int
    win_rate: float
    expectancy: float
    profit_factor: float
    max_drawdown: float


def summarize_results(results: list[float]) -> BacktestResult:
    wins = [value for value in results if value > 0]
    losses = [value for value in results if value < 0]
    win_rate = len(wins) / len(results) if results else 0.0
    avg_win = sum(wins) / len(wins) if wins else 0.0
    avg_loss = abs(sum(losses) / len(losses)) if losses else 0.0

    equity = []
    running = 10_000.0
    for value in results:
        running += value
        equity.append(running)

    return BacktestResult(
        trades=len(results),
        win_rate=win_rate,
        expectancy=expectancy(win_rate, avg_win, avg_loss),
        profit_factor=profit_factor(results),
        max_drawdown=max_drawdown(equity),
    )
