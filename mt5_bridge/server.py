"""Protected MT5 bridge for Zeus Trading.

The bridge runs locally or on a private VPS next to an open MetaTrader 5 terminal.
It accepts only audited previews from the Zeus dashboard and requires a manual
approval token before any live submit route can be attempted.
"""

from __future__ import annotations

import json
import os
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:  # MetaTrader5 is Windows-only in many environments; keep local dev portable.
    import MetaTrader5 as mt5  # type: ignore
except Exception:  # pragma: no cover - depends on host terminal installation.
    mt5 = None


BRIDGE_VERSION = "zeus-mt5-bridge/1.0.0"
DEFAULT_SYMBOLS = ["XAUUSD", "EURUSD", "GBPUSD", "BTCUSD", "US30", "NAS100"]
JOURNAL_PATH = Path(os.getenv("MT5_BRIDGE_JOURNAL", "logs/mt5_bridge_journal.jsonl"))
LIVE_ENABLED = os.getenv("MT5_ENABLE_LIVE", "false").lower() == "true"
REQUIRE_MT5 = os.getenv("MT5_REQUIRE_TERMINAL", "false").lower() == "true"
MAX_SPREAD_POINTS = float(os.getenv("MT5_MAX_SPREAD_POINTS", "80"))


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def write_journal(event_type: str, payload: dict[str, Any]) -> str:
    JOURNAL_PATH.parent.mkdir(parents=True, exist_ok=True)
    journal_id = str(uuid.uuid4())
    entry = {
        "id": journal_id,
        "event_type": event_type,
        "created_at": utc_now(),
        "payload": payload,
    }
    with JOURNAL_PATH.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(entry, separators=(",", ":"), ensure_ascii=True) + "\n")
    return journal_id


def mt5_available() -> bool:
    return mt5 is not None


def ensure_terminal() -> bool:
    if not mt5_available():
        return False
    return bool(mt5.initialize())


def shutdown_terminal() -> None:
    if mt5_available():
        try:
            mt5.shutdown()
        except Exception:
            pass


def normalize_symbol(symbol: str) -> str:
    return "".join(ch for ch in str(symbol or "XAUUSD").upper() if ch.isalnum() or ch in "._-")


def fallback_quote(symbol: str) -> dict[str, Any]:
    bases = {
        "XAUUSD": 2380.0,
        "EURUSD": 1.085,
        "GBPUSD": 1.27,
        "BTCUSD": 68000.0,
        "US30": 39000.0,
        "NAS100": 18000.0,
    }
    base = bases.get(symbol, 100.0)
    drift = ((int(time.time()) % 31) - 15) / 10000
    bid = round(base * (1 + drift), 5)
    ask = round(bid + max(base * 0.00005, 0.01), 5)
    return {
        "ok": True,
        "symbol": symbol,
        "bid": bid,
        "ask": ask,
        "spread_points": round((ask - bid) * 100, 2),
        "timestamp": utc_now(),
        "source": "safe-fallback",
    }


def get_quote(symbol: str) -> dict[str, Any]:
    symbol = normalize_symbol(symbol)
    if not mt5_available() or not ensure_terminal():
        if REQUIRE_MT5:
            raise HTTPException(status_code=503, detail="MetaTrader 5 terminal is not available.")
        return fallback_quote(symbol)

    try:
        tick = mt5.symbol_info_tick(symbol)
        if tick is None:
            raise HTTPException(status_code=404, detail=f"No MT5 quote for {symbol}.")
        bid = float(tick.bid)
        ask = float(tick.ask)
        return {
            "ok": True,
            "symbol": symbol,
            "bid": bid,
            "ask": ask,
            "spread_points": round(abs(ask - bid) * 100, 2),
            "timestamp": utc_now(),
            "source": "mt5",
        }
    finally:
        shutdown_terminal()


def account_snapshot() -> dict[str, Any]:
    if not mt5_available() or not ensure_terminal():
        return {
            "connected": False,
            "login": None,
            "server": None,
            "balance": None,
            "equity": None,
            "currency": None,
            "source": "safe-fallback",
        }

    try:
        info = mt5.account_info()
        if info is None:
            return {"connected": False, "source": "mt5", "reason": "MT5 account_info returned empty."}
        return {
            "connected": True,
            "login": info.login,
            "server": info.server,
            "balance": float(info.balance),
            "equity": float(info.equity),
            "currency": info.currency,
            "source": "mt5",
        }
    finally:
        shutdown_terminal()


class PreviewRequest(BaseModel):
    id: str | None = None
    exchange: str = "mt5-bridge"
    mode: str = "protected-live"
    symbol: str = "XAUUSD"
    side: str = "BUY"
    entry: float = Field(gt=0)
    stopLoss: float | None = None
    stop_loss: float | None = None
    takeProfit: float | None = None
    take_profit: float | None = None
    quantity: float | None = None
    riskAmount: float | None = None
    rewardRisk: float | None = None
    approved: bool = False
    blockers: list[str] = Field(default_factory=list)

    @property
    def stop_value(self) -> float | None:
        return self.stopLoss if self.stopLoss is not None else self.stop_loss

    @property
    def target_value(self) -> float | None:
        return self.takeProfit if self.takeProfit is not None else self.take_profit


class SubmitRequest(BaseModel):
    approvalToken: str
    preview: PreviewRequest


def build_preview(preview: PreviewRequest) -> dict[str, Any]:
    blockers = list(preview.blockers or [])
    symbol = normalize_symbol(preview.symbol)
    side = str(preview.side or "BUY").upper()
    stop = preview.stop_value
    target = preview.target_value
    quantity = float(preview.quantity or 0)
    quote = get_quote(symbol)

    if preview.exchange != "mt5-bridge":
        blockers.append("Bridge accepts only mt5-bridge previews.")
    if preview.mode != "protected-live":
        blockers.append("Bridge submit requires protected-live mode.")
    if not preview.approved:
        blockers.append("Cloudflare risk gate preview is not approved.")
    if side not in {"BUY", "SELL"}:
        blockers.append("Side must be BUY or SELL.")
    if stop is None:
        blockers.append("Stop-loss is required.")
    if target is None:
        blockers.append("Take-profit is required.")
    if quantity <= 0:
        blockers.append("Lot size/quantity must be positive.")
    if quote["spread_points"] > MAX_SPREAD_POINTS:
        blockers.append(f"Spread too wide: {quote['spread_points']} points.")

    approved = not blockers
    response = {
        "ok": approved,
        "preview_ready": approved,
        "reason": "MT5 bridge preview ready." if approved else "MT5 bridge preview blocked.",
        "bridge_version": BRIDGE_VERSION,
        "live_enabled": LIVE_ENABLED,
        "symbol": symbol,
        "side": side,
        "entry": preview.entry,
        "stop_loss": stop,
        "take_profit": target,
        "quantity": quantity,
        "quote": quote,
        "blockers": blockers,
        "timestamp": utc_now(),
    }
    response["journal_id"] = write_journal("order_preview", response)
    return response


app = FastAPI(title="Zeus Trading MT5 Bridge", version=BRIDGE_VERSION)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://zeustrading.online",
        "https://www.zeustrading.online",
        "http://127.0.0.1:8789",
        "http://localhost:8789",
        "http://localhost:8000",
    ],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, Any]:
    account = account_snapshot()
    return {
        "ok": True,
        "version": BRIDGE_VERSION,
        "live_enabled": LIVE_ENABLED,
        "mt5_module_available": mt5_available(),
        "account": account,
        "timestamp": utc_now(),
    }


@app.get("/status")
def status() -> dict[str, Any]:
    """Compatibility alias for simple n8n/VPS health checks."""
    return health()


@app.get("/account")
def account() -> dict[str, Any]:
    snapshot = account_snapshot()
    write_journal("account_snapshot", snapshot)
    return {"ok": True, "account": snapshot}


@app.get("/symbols")
def symbols() -> dict[str, Any]:
    if not mt5_available() or not ensure_terminal():
        return {"ok": True, "symbols": DEFAULT_SYMBOLS, "source": "safe-fallback"}
    try:
        mt5_symbols = mt5.symbols_get()
        names = [item.name for item in mt5_symbols[:500]] if mt5_symbols else DEFAULT_SYMBOLS
        return {"ok": True, "symbols": names, "source": "mt5"}
    finally:
        shutdown_terminal()


@app.get("/quote")
def quote(symbol: str = Query("XAUUSD")) -> dict[str, Any]:
    return get_quote(symbol)


@app.post("/order/preview")
def order_preview(preview: PreviewRequest) -> dict[str, Any]:
    return build_preview(preview)


@app.post("/order/submit")
def order_submit(request: SubmitRequest) -> dict[str, Any]:
    preview_result = build_preview(request.preview)
    if not preview_result["ok"]:
        raise HTTPException(status_code=422, detail=preview_result)
    if not request.approvalToken or "." not in request.approvalToken:
        raise HTTPException(status_code=422, detail="Manual approval token is required.")

    if not LIVE_ENABLED:
        payload = {
            "ok": True,
            "submitted": False,
            "dry_run": True,
            "reason": "Bridge accepted approval, but MT5_ENABLE_LIVE=false so no live order was sent.",
            "preview": preview_result,
        }
        payload["journal_id"] = write_journal("order_submit_dry_run", payload)
        return payload

    if not mt5_available() or not ensure_terminal():
        raise HTTPException(status_code=503, detail="MetaTrader 5 terminal is not available for live submit.")

    try:
        symbol = preview_result["symbol"]
        side = preview_result["side"]
        order_type = mt5.ORDER_TYPE_BUY if side == "BUY" else mt5.ORDER_TYPE_SELL
        mt5_request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": symbol,
            "volume": float(preview_result["quantity"]),
            "type": order_type,
            "price": float(preview_result["quote"]["ask"] if side == "BUY" else preview_result["quote"]["bid"]),
            "sl": float(preview_result["stop_loss"]),
            "tp": float(preview_result["take_profit"]),
            "deviation": int(os.getenv("MT5_MAX_DEVIATION", "20")),
            "magic": int(os.getenv("MT5_MAGIC", "260526")),
            "comment": "Zeus protected live",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }
        result = mt5.order_send(mt5_request)
        payload = {
            "ok": result is not None and result.retcode == mt5.TRADE_RETCODE_DONE,
            "submitted": result is not None,
            "reason": "MT5 live order submitted." if result is not None else "MT5 order_send returned empty.",
            "mt5_response": result._asdict() if result is not None and hasattr(result, "_asdict") else str(result),
            "preview": preview_result,
        }
        payload["journal_id"] = write_journal("order_submit_live", payload)
        if not payload["ok"]:
            raise HTTPException(status_code=502, detail=payload)
        return payload
    finally:
        shutdown_terminal()


@app.post("/send_order")
def deprecated_send_order(payload: dict[str, Any]) -> dict[str, Any]:
    """Reject unsafe legacy order routes.

    n8n and browser agents must use /order/preview first, then Zeus manual
    approval and /order/submit with an approval token. This route exists only
    to make unsafe examples fail loudly instead of accidentally routing live.
    """
    write_journal("deprecated_send_order_blocked", {"request": payload, "reason": "Use /order/preview and /order/submit."})
    raise HTTPException(
        status_code=423,
        detail={
            "ok": False,
            "reason": "Direct /send_order is blocked. Use /order/preview, Zeus risk gate, manual approval, then /order/submit.",
        },
    )


@app.post("/positions/flatten")
def flatten_positions(payload: dict[str, Any] | None = None) -> dict[str, Any]:
    if not LIVE_ENABLED:
        response = {
            "ok": True,
            "submitted": False,
            "dry_run": True,
            "reason": "Kill switch recorded. MT5_ENABLE_LIVE=false so no positions were closed.",
            "request": payload or {},
        }
        response["journal_id"] = write_journal("kill_switch_dry_run", response)
        return response

    if not mt5_available() or not ensure_terminal():
        raise HTTPException(status_code=503, detail="MetaTrader 5 terminal is not available for flatten.")

    try:
        positions = mt5.positions_get() or []
        results = []
        for position in positions:
            side = mt5.ORDER_TYPE_SELL if position.type == mt5.POSITION_TYPE_BUY else mt5.ORDER_TYPE_BUY
            tick = mt5.symbol_info_tick(position.symbol)
            price = tick.bid if side == mt5.ORDER_TYPE_SELL else tick.ask
            close_request = {
                "action": mt5.TRADE_ACTION_DEAL,
                "position": position.ticket,
                "symbol": position.symbol,
                "volume": position.volume,
                "type": side,
                "price": price,
                "deviation": int(os.getenv("MT5_MAX_DEVIATION", "20")),
                "magic": int(os.getenv("MT5_MAGIC", "260526")),
                "comment": "Zeus kill switch",
                "type_time": mt5.ORDER_TIME_GTC,
                "type_filling": mt5.ORDER_FILLING_IOC,
            }
            result = mt5.order_send(close_request)
            results.append(result._asdict() if result is not None and hasattr(result, "_asdict") else str(result))
        response = {"ok": True, "closed_count": len(results), "results": results}
        response["journal_id"] = write_journal("kill_switch_live", response)
        return response
    finally:
        shutdown_terminal()


@app.get("/journal")
def journal(limit: int = Query(100, ge=1, le=500)) -> dict[str, Any]:
    if not JOURNAL_PATH.exists():
        return {"ok": True, "entries": []}
    lines = JOURNAL_PATH.read_text(encoding="utf-8").splitlines()[-limit:]
    entries = [json.loads(line) for line in lines if line.strip()]
    return {"ok": True, "entries": entries}
