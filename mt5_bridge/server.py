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

from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:  # MetaTrader5 is Windows-only in many environments; keep local dev portable.
    import MetaTrader5 as mt5  # type: ignore
except Exception:  # pragma: no cover - depends on host terminal installation.
    mt5 = None


BRIDGE_VERSION = "zeus-mt5-bridge/1.0.0"
DEFAULT_SYMBOLS = ["XAUUSD", "EURUSD", "GBPUSD", "BTCUSD", "US30", "NAS100"]
JOURNAL_PATH = Path(os.getenv("MT5_BRIDGE_JOURNAL", "logs/mt5_bridge_journal.jsonl"))
GUARD_STATE_PATH = Path(os.getenv("MT5_GUARD_STATE", "logs/mt5_guard_state.json"))
LIVE_ENABLED = os.getenv("MT5_ENABLE_LIVE", "false").lower() == "true"
REQUIRE_MT5 = os.getenv("MT5_REQUIRE_TERMINAL", "false").lower() == "true"
ALLOW_REAL_ACCOUNT = os.getenv("MT5_ALLOW_REAL_ACCOUNT", "false").lower() == "true"
REQUIRE_DEMO_ACCOUNT = os.getenv("MT5_REQUIRE_DEMO_ACCOUNT", "true").lower() == "true"
MAX_SPREAD_POINTS = float(os.getenv("MT5_MAX_SPREAD_POINTS", "80"))
GUARD_INITIAL_BALANCE = float(os.getenv("MT5_GUARD_INITIAL_BALANCE", "100000"))
GUARD_DAILY_LOSS_LIMIT_PERCENT = float(os.getenv("MT5_GUARD_DAILY_LOSS_LIMIT_PERCENT", "0.03"))
GUARD_MAX_TOTAL_DRAWDOWN_PERCENT = float(os.getenv("MT5_GUARD_MAX_TOTAL_DRAWDOWN_PERCENT", "0.06"))
KILL_TOKEN = os.getenv("MT5_KILL_TOKEN", "")


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


def today_key() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def default_guard_state() -> dict[str, Any]:
    return {
        "kill_switch_active": False,
        "kill_reason": "",
        "kill_updated_at": None,
        "trade_date": today_key(),
        "initial_balance": GUARD_INITIAL_BALANCE,
        "daily_start_equity": GUARD_INITIAL_BALANCE,
        "high_water_equity": GUARD_INITIAL_BALANCE,
        "daily_realized_pnl": 0.0,
        "daily_unrealized_pnl": 0.0,
        "daily_loss_limit_percent": GUARD_DAILY_LOSS_LIMIT_PERCENT,
        "max_total_drawdown_percent": GUARD_MAX_TOTAL_DRAWDOWN_PERCENT,
        "paper_positions": [],
        "paper_closed_trades": [],
    }


def load_guard_state() -> dict[str, Any]:
    if not GUARD_STATE_PATH.exists():
        return default_guard_state()
    try:
        loaded = json.loads(GUARD_STATE_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        loaded = {}
    state = {**default_guard_state(), **loaded}
    if state.get("trade_date") != today_key():
        state["trade_date"] = today_key()
        state["daily_start_equity"] = float(state.get("high_water_equity") or state.get("initial_balance") or GUARD_INITIAL_BALANCE)
        state["daily_realized_pnl"] = 0.0
        state["daily_unrealized_pnl"] = 0.0
    return state


def save_guard_state(state: dict[str, Any]) -> dict[str, Any]:
    GUARD_STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    GUARD_STATE_PATH.write_text(json.dumps(state, indent=2, sort_keys=True, ensure_ascii=True), encoding="utf-8")
    return state


def require_guard_token(headers: dict[str, str] | None, payload: dict[str, Any] | None) -> None:
    if not KILL_TOKEN:
        return
    supplied = ""
    if headers:
        supplied = headers.get("x-zeus-token") or headers.get("X-Zeus-Token") or ""
    supplied = supplied or str((payload or {}).get("token") or "")
    if supplied != KILL_TOKEN:
        raise HTTPException(status_code=401, detail="Valid MT5_KILL_TOKEN is required.")


def account_equity_for_guard(account: dict[str, Any], state: dict[str, Any]) -> float:
    equity = account.get("equity")
    if equity is not None:
        return float(equity)
    return float(state.get("initial_balance") or GUARD_INITIAL_BALANCE) + float(state.get("daily_realized_pnl") or 0) + float(state.get("daily_unrealized_pnl") or 0)


def refresh_guard_state(account: dict[str, Any] | None = None) -> dict[str, Any]:
    state = load_guard_state()
    account = account or account_snapshot()
    equity = account_equity_for_guard(account, state)
    state["high_water_equity"] = max(float(state.get("high_water_equity") or equity), equity)
    if not state.get("initial_balance"):
        state["initial_balance"] = equity
    if not state.get("daily_start_equity"):
        state["daily_start_equity"] = equity
    save_guard_state(state)
    return state


def guard_summary(account: dict[str, Any] | None = None) -> dict[str, Any]:
    account = account or account_snapshot()
    state = refresh_guard_state(account)
    equity = account_equity_for_guard(account, state)
    daily_start = float(state.get("daily_start_equity") or GUARD_INITIAL_BALANCE)
    initial_balance = float(state.get("initial_balance") or GUARD_INITIAL_BALANCE)
    daily_loss_limit = daily_start * float(state.get("daily_loss_limit_percent") or GUARD_DAILY_LOSS_LIMIT_PERCENT)
    max_total_loss = initial_balance * float(state.get("max_total_drawdown_percent") or GUARD_MAX_TOTAL_DRAWDOWN_PERCENT)
    static_floor = initial_balance - max_total_loss
    daily_pnl = equity - daily_start
    daily_loss_buffer = daily_loss_limit + daily_pnl
    max_drawdown_buffer = equity - static_floor
    blockers = []

    if state.get("kill_switch_active"):
        blockers.append(f"Kill switch active: {state.get('kill_reason') or 'manual stop'}")
    if daily_loss_buffer <= 0:
        blockers.append("Daily drawdown buffer is breached.")
    if max_drawdown_buffer <= 0:
        blockers.append("Max total drawdown buffer is breached.")

    auto_killed = False
    if not state.get("kill_switch_active") and (daily_loss_buffer <= 0 or max_drawdown_buffer <= 0):
        state["kill_switch_active"] = True
        state["kill_reason"] = "Automatic drawdown guard triggered."
        state["kill_updated_at"] = utc_now()
        save_guard_state(state)
        auto_killed = True
        blockers.insert(0, state["kill_reason"])
        write_journal("auto_kill_switch", {"state": state, "equity": equity, "blockers": blockers})

    return {
        "ok": not blockers,
        "auto_killed": auto_killed,
        "blockers": blockers,
        "state": state,
        "account": account,
        "equity": round(equity, 2),
        "daily_pnl": round(daily_pnl, 2),
        "daily_loss_limit": round(daily_loss_limit, 2),
        "daily_loss_buffer_remaining": round(max(daily_loss_buffer, 0), 2),
        "static_drawdown_floor": round(static_floor, 2),
        "max_drawdown_buffer_remaining": round(max(max_drawdown_buffer, 0), 2),
        "live_account_blockers": live_account_blockers(account),
    }


def guard_blockers(account: dict[str, Any] | None = None) -> list[str]:
    return guard_summary(account)["blockers"]


def record_paper_position(preview_result: dict[str, Any], approval_token: str) -> dict[str, Any]:
    state = refresh_guard_state()
    position = {
        "id": str(uuid.uuid4()),
        "opened_at": utc_now(),
        "approval_token_hash": str(abs(hash(approval_token))),
        "symbol": preview_result["symbol"],
        "side": preview_result["side"],
        "entry": float(preview_result["entry"]),
        "stop_loss": float(preview_result["stop_loss"]),
        "take_profit": float(preview_result["take_profit"]),
        "quantity": float(preview_result["quantity"]),
        "estimated_risk": round(abs(float(preview_result["entry"]) - float(preview_result["stop_loss"])) * float(preview_result["quantity"]), 5),
        "estimated_reward": round(abs(float(preview_result["take_profit"]) - float(preview_result["entry"])) * float(preview_result["quantity"]), 5),
        "status": "open",
    }
    state.setdefault("paper_positions", []).append(position)
    save_guard_state(state)
    write_journal("paper_position_opened", {"position": position})
    return position


def close_paper_positions(reason: str = "manual paper close") -> dict[str, Any]:
    state = refresh_guard_state()
    open_positions = [item for item in state.get("paper_positions", []) if item.get("status") == "open"]
    closed = []
    realized = float(state.get("daily_realized_pnl") or 0)
    for position in open_positions:
        quote_data = get_quote(position["symbol"])
        close_price = float(quote_data["bid"] if position["side"] == "BUY" else quote_data["ask"])
        multiplier = 1 if position["side"] == "BUY" else -1
        pnl = (close_price - float(position["entry"])) * multiplier * float(position["quantity"])
        position = {**position, "status": "closed", "closed_at": utc_now(), "close_price": close_price, "pnl": round(pnl, 5), "close_reason": reason}
        closed.append(position)
        realized += pnl
    remaining = [item for item in state.get("paper_positions", []) if item.get("status") != "open"]
    state["paper_positions"] = remaining
    state.setdefault("paper_closed_trades", []).extend(closed)
    state["daily_realized_pnl"] = realized
    save_guard_state(state)
    write_journal("paper_positions_closed", {"closed": closed, "reason": reason})
    return {"closed_count": len(closed), "closed": closed, "daily_realized_pnl": round(realized, 5)}


def mt5_available() -> bool:
    return mt5 is not None


def mt5_initialize_kwargs() -> dict[str, Any]:
    kwargs: dict[str, Any] = {}
    path = os.getenv("MT5_PATH", "").strip()
    login = os.getenv("MT5_LOGIN", "").strip()
    password = os.getenv("MT5_PASSWORD", "")
    server = os.getenv("MT5_SERVER", "").strip()
    timeout = os.getenv("MT5_TIMEOUT_MS", "").strip()
    portable = os.getenv("MT5_PORTABLE", "").strip().lower()

    if path:
        kwargs["path"] = path
    if login:
        kwargs["login"] = int(login)
    if password:
        kwargs["password"] = password
    if server:
        kwargs["server"] = server
    if timeout:
        kwargs["timeout"] = int(timeout)
    if portable in {"true", "1", "yes"}:
        kwargs["portable"] = True
    return kwargs


def mt5_connection_config() -> dict[str, Any]:
    return {
        "path_configured": bool(os.getenv("MT5_PATH", "").strip()),
        "login_configured": bool(os.getenv("MT5_LOGIN", "").strip()),
        "server_configured": bool(os.getenv("MT5_SERVER", "").strip()),
        "password_configured": bool(os.getenv("MT5_PASSWORD", "")),
        "require_demo_account": REQUIRE_DEMO_ACCOUNT,
        "allow_real_account": ALLOW_REAL_ACCOUNT,
    }


def ensure_terminal() -> bool:
    if not mt5_available():
        return False
    try:
        return bool(mt5.initialize(**mt5_initialize_kwargs()))
    except Exception:
        return False


def account_trade_mode_label(mode: Any) -> str:
    if mode is None or not mt5_available():
        return "unknown"
    labels = {
        getattr(mt5, "ACCOUNT_TRADE_MODE_DEMO", object()): "demo",
        getattr(mt5, "ACCOUNT_TRADE_MODE_CONTEST", object()): "contest",
        getattr(mt5, "ACCOUNT_TRADE_MODE_REAL", object()): "real",
    }
    return labels.get(mode, "unknown")


def live_account_blockers(account: dict[str, Any]) -> list[str]:
    if not LIVE_ENABLED:
        return []
    if not account.get("connected"):
        return ["MT5 terminal/account is not connected."]

    trade_mode = account.get("trade_mode_label", "unknown")
    blockers = []
    if REQUIRE_DEMO_ACCOUNT and trade_mode not in {"demo", "contest"}:
        blockers.append(f"Live submit requires a demo/contest MT5 account. Current mode: {trade_mode}.")
    if trade_mode == "real" and not ALLOW_REAL_ACCOUNT:
        blockers.append("Real MT5 account detected. Set MT5_ALLOW_REAL_ACCOUNT=true only after full live unlock review.")
    return blockers


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
            "trade_mode": None,
            "trade_mode_label": "unknown",
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
            "trade_mode": getattr(info, "trade_mode", None),
            "trade_mode_label": account_trade_mode_label(getattr(info, "trade_mode", None)),
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
    guard = guard_summary()
    blockers.extend(guard["blockers"])
    if LIVE_ENABLED:
        blockers.extend(guard["live_account_blockers"])

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
        "guard": guard,
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
    guard = guard_summary(account)
    return {
        "ok": True,
        "version": BRIDGE_VERSION,
        "live_enabled": LIVE_ENABLED,
        "mt5_module_available": mt5_available(),
        "mt5_connection_config": mt5_connection_config(),
        "account": account,
        "guard": guard,
        "timestamp": utc_now(),
    }


@app.get("/status")
def status() -> dict[str, Any]:
    """Compatibility alias for simple n8n/VPS health checks."""
    return health()


@app.get("/account")
def account() -> dict[str, Any]:
    snapshot = account_snapshot()
    guard = guard_summary(snapshot)
    write_journal("account_snapshot", {"account": snapshot, "guard": guard})
    return {"ok": True, "account": snapshot, "guard": guard}


@app.get("/guard")
def guard() -> dict[str, Any]:
    return {"ok": True, "guard": guard_summary()}


@app.post("/kill")
def engage_kill(payload: dict[str, Any] | None = None, x_zeus_token: str | None = Header(None)) -> dict[str, Any]:
    require_guard_token({"x-zeus-token": x_zeus_token or ""}, payload)
    state = load_guard_state()
    state["kill_switch_active"] = True
    state["kill_reason"] = str((payload or {}).get("reason") or "Manual bridge kill switch.")
    state["kill_updated_at"] = utc_now()
    save_guard_state(state)
    response = {"ok": True, "guard": guard_summary(), "reason": state["kill_reason"]}
    response["journal_id"] = write_journal("manual_kill_switch", response)
    return response


@app.post("/kill/clear")
def clear_kill(payload: dict[str, Any] | None = None, x_zeus_token: str | None = Header(None)) -> dict[str, Any]:
    require_guard_token({"x-zeus-token": x_zeus_token or ""}, payload)
    state = load_guard_state()
    state["kill_switch_active"] = False
    state["kill_reason"] = str((payload or {}).get("reason") or "Manual bridge kill clear.")
    state["kill_updated_at"] = utc_now()
    save_guard_state(state)
    response = {"ok": True, "guard": guard_summary(), "reason": state["kill_reason"]}
    response["journal_id"] = write_journal("manual_kill_switch_clear", response)
    return response


@app.post("/paper/reset")
def paper_reset(payload: dict[str, Any] | None = None, x_zeus_token: str | None = Header(None)) -> dict[str, Any]:
    require_guard_token({"x-zeus-token": x_zeus_token or ""}, payload)
    balance = float((payload or {}).get("initial_balance") or GUARD_INITIAL_BALANCE)
    state = default_guard_state()
    state["initial_balance"] = balance
    state["daily_start_equity"] = balance
    state["high_water_equity"] = balance
    save_guard_state(state)
    response = {"ok": True, "guard": guard_summary(), "reason": "Paper ledger reset."}
    response["journal_id"] = write_journal("paper_ledger_reset", response)
    return response


@app.post("/paper/close")
def paper_close(payload: dict[str, Any] | None = None, x_zeus_token: str | None = Header(None)) -> dict[str, Any]:
    require_guard_token({"x-zeus-token": x_zeus_token or ""}, payload)
    result = close_paper_positions(str((payload or {}).get("reason") or "manual paper close"))
    response = {"ok": True, "result": result, "guard": guard_summary()}
    response["journal_id"] = write_journal("paper_close_request", response)
    return response


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
        position = record_paper_position(preview_result, request.approvalToken)
        payload = {
            "ok": True,
            "submitted": False,
            "dry_run": True,
            "paper_position": position,
            "reason": "Bridge accepted approval and recorded a paper position. MT5_ENABLE_LIVE=false so no live order was sent.",
            "preview": preview_result,
        }
        payload["journal_id"] = write_journal("order_submit_dry_run", payload)
        return payload

    live_account = account_snapshot()
    account_blockers = live_account_blockers(live_account)
    if account_blockers:
        payload = {"ok": False, "reason": "MT5 account safety check blocked live submit.", "account": live_account, "blockers": account_blockers, "preview": preview_result}
        payload["journal_id"] = write_journal("live_account_blocked", payload)
        raise HTTPException(status_code=423, detail=payload)

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
    state = load_guard_state()
    state["kill_switch_active"] = True
    state["kill_reason"] = str((payload or {}).get("reason") or "Flatten/kill switch requested.")
    state["kill_updated_at"] = utc_now()
    save_guard_state(state)

    if not LIVE_ENABLED:
        paper_close_result = close_paper_positions(state["kill_reason"])
        response = {
            "ok": True,
            "submitted": False,
            "dry_run": True,
            "reason": "Kill switch recorded. MT5_ENABLE_LIVE=false so no positions were closed.",
            "request": payload or {},
            "paper_close": paper_close_result,
            "guard": guard_summary(),
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
