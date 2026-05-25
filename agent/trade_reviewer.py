from __future__ import annotations

from dataclasses import dataclass

from backtesting.metrics import expectancy, max_drawdown, profit_factor


@dataclass(frozen=True)
class DailyReport:
    trades_taken: int
    wins: int
    losses: int
    net_pnl: float
    expectancy: float
    profit_factor: float
    max_drawdown: float
    rule_violations: int


def build_daily_report(results: list[float], rule_violations: int = 0) -> DailyReport:
    wins = [value for value in results if value > 0]
    losses = [value for value in results if value < 0]
    win_rate = len(wins) / len(results) if results else 0
    avg_win = sum(wins) / len(wins) if wins else 0
    avg_loss = abs(sum(losses) / len(losses)) if losses else 0
    equity = []
    running = 0.0
    for value in results:
        running += value
        equity.append(running)

    return DailyReport(
        trades_taken=len(results),
        wins=len(wins),
        losses=len(losses),
        net_pnl=sum(results),
        expectancy=expectancy(win_rate, avg_win, avg_loss),
        profit_factor=profit_factor(results),
        max_drawdown=max_drawdown(equity),
        rule_violations=rule_violations,
    )
