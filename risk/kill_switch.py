from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class KillSwitchState:
    active: bool
    reason: str


class KillSwitch:
    def evaluate(
        self,
        daily_pnl: float,
        max_daily_loss_amount: float,
        broker_connected: bool,
        manual_pause: bool = False,
    ) -> KillSwitchState:
        if manual_pause:
            return KillSwitchState(True, "Manual pause enabled.")
        if not broker_connected:
            return KillSwitchState(True, "Broker disconnected.")
        if daily_pnl <= -abs(max_daily_loss_amount):
            return KillSwitchState(True, "Daily max loss reached.")
        return KillSwitchState(False, "Execution allowed.")
