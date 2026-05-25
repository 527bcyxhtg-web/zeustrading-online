from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4

from risk.risk_manager import TradePlan


@dataclass(frozen=True)
class PaperOrder:
    symbol: str
    side: str
    qty: int
    entry_type: str
    entry_price: float
    stop_loss: float
    take_profit: float
    transmit: bool
    client_order_id: str
    created_at: str


class PaperOrderManager:
    def build_bracket_preview(self, plan: TradePlan) -> PaperOrder:
        if not plan.approved:
            raise ValueError(f"Cannot build order for rejected plan: {plan.reason}")

        created_at = datetime.now(timezone.utc).isoformat()
        return PaperOrder(
            symbol=plan.symbol,
            side="buy" if plan.direction == "LONG" else "sell",
            qty=plan.position_size,
            entry_type="limit",
            entry_price=plan.entry,
            stop_loss=plan.stop_loss,
            take_profit=plan.target,
            transmit=False,
            client_order_id=f"prl-{plan.symbol.lower()}-{uuid4().hex[:16]}",
            created_at=created_at,
        )


@dataclass(frozen=True)
class ExecutionPolicy:
    mode: Literal["paper", "live"] = "paper"
    account_size: float = 0.0
    live_unlocked: bool = False
    manual_confirmed: bool = False
    kill_switch_active: bool = False
    audit_log_ready: bool = False
    broker_reconciled: bool = False
    max_live_risk_per_trade: float = 0.0025
    live_acknowledged: bool = False
    account_reconciled: bool = False


class ExecutionGuard:
    def approve_execution(self, plan: TradePlan, policy: ExecutionPolicy) -> tuple[bool, str]:
        if not plan.approved:
            return False, f"Rejected plan: {plan.reason}"

        if policy.kill_switch_active:
            return False, "Kill switch active."

        if policy.mode == "paper":
            return True, "Paper execution approved."

        if not policy.live_unlocked:
            return False, "Live trading is locked."

        if not policy.live_acknowledged:
            return False, "Live risk acknowledgement missing."

        if not policy.manual_confirmed:
            return False, "Manual confirmation required."

        if not policy.audit_log_ready:
            return False, "Audit log is not ready."

        if not policy.broker_reconciled:
            return False, "Broker positions/orders are not reconciled."

        if not policy.account_reconciled:
            return False, "Account buying power/equity not reconciled."

        if policy.account_size <= 0:
            return False, "Account size required for live execution."

        if plan.risk_amount > policy.account_size * policy.max_live_risk_per_trade:
            return False, "Invalid live risk configuration."

        return True, "Controlled live execution approved."
