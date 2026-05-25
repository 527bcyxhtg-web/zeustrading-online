from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class BrokerPosition:
    symbol: str
    qty: int


@dataclass(frozen=True)
class BrokerOpenOrder:
    symbol: str
    qty: int
    side: str
    client_order_id: str


@dataclass(frozen=True)
class BrokerState:
    connected: bool
    buying_power: float
    positions: tuple[BrokerPosition, ...] = ()
    open_orders: tuple[BrokerOpenOrder, ...] = ()


@dataclass(frozen=True)
class ReconciliationResult:
    ok: bool
    reason: str


class BrokerReconciler:
    def check_ready_for_new_order(self, symbol: str, required_buying_power: float, state: BrokerState) -> ReconciliationResult:
        if not state.connected:
            return ReconciliationResult(False, "Broker disconnected.")

        if state.buying_power < required_buying_power:
            return ReconciliationResult(False, "Insufficient buying power.")

        if any(order.symbol == symbol.upper() for order in state.open_orders):
            return ReconciliationResult(False, "Open order already exists for symbol.")

        return ReconciliationResult(True, "Broker reconciled.")
