from __future__ import annotations

from broker.alpaca_client import AlpacaClient
from broker.reconciliation import BrokerOpenOrder, BrokerPosition, BrokerState


def fetch_alpaca_broker_state(client: AlpacaClient) -> BrokerState:
    account = client.get_account()
    positions = client.get_positions()
    open_orders = client.get_open_orders()

    return BrokerState(
        connected=True,
        buying_power=float(account.get("buying_power", 0) or 0),
        positions=tuple(
            BrokerPosition(
                symbol=str(position.get("symbol", "")).upper(),
                qty=int(float(position.get("qty", 0) or 0)),
            )
            for position in positions
        ),
        open_orders=tuple(
            BrokerOpenOrder(
                symbol=str(order.get("symbol", "")).upper(),
                qty=int(float(order.get("qty", 0) or 0)),
                side=str(order.get("side", "")),
                client_order_id=str(order.get("client_order_id", "")),
            )
            for order in open_orders
        ),
    )
