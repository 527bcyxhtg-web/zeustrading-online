from __future__ import annotations

from dataclasses import dataclass

from broker.order_manager import PaperOrder


@dataclass(frozen=True)
class IbkrConnectionConfig:
    host: str = "127.0.0.1"
    port: int = 7497
    client_id: int = 11
    paper: bool = True


@dataclass(frozen=True)
class IbkrBracketPreview:
    parent: dict
    take_profit: dict
    stop_loss: dict


class IbkrClient:
    def __init__(self, config: IbkrConnectionConfig):
        self.config = config

    def build_bracket_preview(self, order: PaperOrder, next_order_id: int, transmit: bool = False) -> IbkrBracketPreview:
        action = "BUY" if order.side == "buy" else "SELL"
        exit_action = "SELL" if action == "BUY" else "BUY"
        parent = {
            "orderId": next_order_id,
            "action": action,
            "orderType": "LMT",
            "totalQuantity": order.qty,
            "lmtPrice": order.entry_price,
            "transmit": False,
            "clientOrderId": order.client_order_id,
        }
        take_profit = {
            "orderId": next_order_id + 1,
            "action": exit_action,
            "orderType": "LMT",
            "totalQuantity": order.qty,
            "lmtPrice": order.take_profit,
            "parentId": next_order_id,
            "transmit": False,
        }
        stop_loss = {
            "orderId": next_order_id + 2,
            "action": exit_action,
            "orderType": "STP",
            "totalQuantity": order.qty,
            "auxPrice": order.stop_loss,
            "parentId": next_order_id,
            "transmit": transmit,
        }
        return IbkrBracketPreview(parent, take_profit, stop_loss)
