from __future__ import annotations

import json
from dataclasses import dataclass
from urllib import request

from broker.order_manager import PaperOrder


@dataclass(frozen=True)
class AlpacaOrderRequest:
    endpoint: str
    payload: dict
    paper: bool


class AlpacaClient:
    def __init__(self, base_url: str, api_key: str = "", api_secret: str = "", paper: bool = True):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.api_secret = api_secret
        self.paper = paper

    def build_order_request(self, order: PaperOrder) -> AlpacaOrderRequest:
        return AlpacaOrderRequest(
            endpoint=f"{self.base_url}/v2/orders",
            paper=self.paper,
            payload={
                "symbol": order.symbol,
                "qty": str(order.qty),
                "side": order.side,
                "type": order.entry_type,
                "time_in_force": "day",
                "limit_price": str(order.entry_price),
                "order_class": "bracket",
                "client_order_id": order.client_order_id,
                "take_profit": {"limit_price": str(order.take_profit)},
                "stop_loss": {"stop_price": str(order.stop_loss)},
            },
        )

    def _request_json(self, method: str, endpoint: str, payload: dict | None = None, timeout_seconds: int = 10) -> dict | list:
        if not self.api_key or not self.api_secret:
            raise ValueError("Missing Alpaca API credentials.")

        body = json.dumps(payload).encode("utf-8") if payload is not None else None
        req = request.Request(
            endpoint,
            data=body,
            method=method,
            headers={
                "Content-Type": "application/json",
                "APCA-API-KEY-ID": self.api_key,
                "APCA-API-SECRET-KEY": self.api_secret,
            },
        )

        with request.urlopen(req, timeout=timeout_seconds) as response:
            return json.loads(response.read().decode("utf-8"))

    def submit_order(self, order_request: AlpacaOrderRequest, timeout_seconds: int = 10) -> dict:
        result = self._request_json("POST", order_request.endpoint, order_request.payload, timeout_seconds)
        if not isinstance(result, dict):
            raise ValueError("Unexpected Alpaca order response.")
        return result

    def get_account(self, timeout_seconds: int = 10) -> dict:
        result = self._request_json("GET", f"{self.base_url}/v2/account", timeout_seconds=timeout_seconds)
        if not isinstance(result, dict):
            raise ValueError("Unexpected Alpaca account response.")
        return result

    def get_positions(self, timeout_seconds: int = 10) -> list:
        result = self._request_json("GET", f"{self.base_url}/v2/positions", timeout_seconds=timeout_seconds)
        if not isinstance(result, list):
            raise ValueError("Unexpected Alpaca positions response.")
        return result

    def get_open_orders(self, timeout_seconds: int = 10) -> list:
        result = self._request_json("GET", f"{self.base_url}/v2/orders?status=open", timeout_seconds=timeout_seconds)
        if not isinstance(result, list):
            raise ValueError("Unexpected Alpaca orders response.")
        return result
