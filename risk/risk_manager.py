from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RiskConfig:
    account_size: float
    risk_per_trade: float = 0.005
    max_daily_loss: float = 0.015
    min_reward_risk: float = 2.0
    max_trades_per_day: int = 3
    max_spread_percent: float = 0.08


@dataclass(frozen=True)
class TradePlan:
    symbol: str
    direction: str
    entry: float
    stop_loss: float
    target: float
    position_size: int
    risk_amount: float
    reward_risk: float
    approved: bool
    reason: str


class RiskManager:
    def __init__(self, config: RiskConfig):
        self.config = config

    def build_trade_plan(
        self,
        symbol: str,
        direction: str,
        entry: float,
        stop_loss: float,
        target: float,
        trades_today: int,
        daily_pnl: float,
        spread_percent: float = 0.0,
        news_risk: str = "low",
    ) -> TradePlan:
        direction = direction.upper()

        if direction not in {"LONG", "SHORT"}:
            return self._reject(symbol, direction, entry, stop_loss, target, "Invalid direction.")

        if trades_today >= self.config.max_trades_per_day:
            return self._reject(symbol, direction, entry, stop_loss, target, "Max trades reached.")

        max_daily_loss_amount = self.config.account_size * self.config.max_daily_loss
        if daily_pnl <= -max_daily_loss_amount:
            return self._reject(symbol, direction, entry, stop_loss, target, "Daily loss limit reached.")

        if news_risk.lower() == "high":
            return self._reject(symbol, direction, entry, stop_loss, target, "High-impact news risk.")

        if spread_percent > self.config.max_spread_percent:
            return self._reject(symbol, direction, entry, stop_loss, target, "Spread too wide.")

        risk_per_share = abs(entry - stop_loss)
        if risk_per_share <= 0:
            return self._reject(symbol, direction, entry, stop_loss, target, "Invalid stop-loss.")

        reward_per_share = abs(target - entry)
        reward_risk = reward_per_share / risk_per_share
        if reward_risk < self.config.min_reward_risk:
            return self._reject(symbol, direction, entry, stop_loss, target, "Reward/risk too low.")

        risk_amount = self.config.account_size * self.config.risk_per_trade
        position_size = int(risk_amount / risk_per_share)
        if position_size <= 0:
            return self._reject(symbol, direction, entry, stop_loss, target, "Position size too small.")

        return TradePlan(
            symbol=symbol.upper(),
            direction=direction,
            entry=entry,
            stop_loss=stop_loss,
            target=target,
            position_size=position_size,
            risk_amount=risk_amount,
            reward_risk=reward_risk,
            approved=True,
            reason="Risk approved.",
        )

    @staticmethod
    def _reject(symbol: str, direction: str, entry: float, stop_loss: float, target: float, reason: str) -> TradePlan:
        return TradePlan(
            symbol=symbol.upper(),
            direction=direction.upper(),
            entry=entry,
            stop_loss=stop_loss,
            target=target,
            position_size=0,
            risk_amount=0,
            reward_risk=0,
            approved=False,
            reason=reason,
        )
