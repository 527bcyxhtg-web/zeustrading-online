from __future__ import annotations

from dataclasses import asdict

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import load_settings
from app.live_cli import LIVE_ORDER_CONFIRM, build_plan
from app.main import TradingAgent
from broker.live_executor import LiveExecutor
from broker.order_manager import ExecutionPolicy, PaperOrderManager
from broker.credentials import load_alpaca_credentials, validate_alpaca_credentials


api = FastAPI(title="Prop Research Lab API", version="1.0.0")
settings = load_settings()

origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
if origins:
    api.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Authorization", "Content-Type", "X-Admin-Token"],
    )


class DryRunRequest(BaseModel):
    symbol: str = Field(default="AMD")
    direction: str = Field(default="LONG", pattern="^(LONG|SHORT)$")
    entry: float
    stop: float
    target: float
    mode: str = Field(default="paper", pattern="^(paper|live)$")


class SubmitRequest(DryRunRequest):
    confirm: str = ""


def require_admin(x_admin_token: str | None = Header(default=None)) -> None:
    if not settings.api_admin_token:
        raise HTTPException(status_code=503, detail="API admin token is not configured.")
    if x_admin_token != settings.api_admin_token:
        raise HTTPException(status_code=401, detail="Invalid admin token.")


@api.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "environment": settings.environment,
        "broker_mode": settings.broker_mode,
        "live_unlocked": settings.live_execution_unlocked,
        "submit_enabled": settings.enable_submit_endpoint,
    }


@api.get("/preflight/{mode}")
def preflight(mode: str, x_admin_token: str | None = Header(default=None)) -> dict:
    require_admin(x_admin_token)
    if mode not in {"paper", "live"}:
        raise HTTPException(status_code=400, detail="mode must be paper or live")
    credentials = load_alpaca_credentials(paper=mode == "paper")
    credential_check = validate_alpaca_credentials(credentials)
    return {
        "mode": mode,
        "credentials": asdict(credential_check),
        "endpoint": credentials.base_url,
        "live_acknowledged": mode == "paper" or settings.live_execution_ack,
        "ready": credential_check.ok and (mode == "paper" or settings.live_execution_ack),
    }


@api.get("/scan/{symbol}")
def scan(symbol: str, x_admin_token: str | None = Header(default=None)) -> dict:
    require_admin(x_admin_token)
    return TradingAgent(settings).scan_symbol(symbol)


@api.post("/dry-run")
def dry_run(payload: DryRunRequest, x_admin_token: str | None = Header(default=None)) -> dict:
    require_admin(x_admin_token)
    plan = build_plan(settings, payload.symbol, payload.entry, payload.stop, payload.target, payload.direction)
    if not plan.approved:
        return {"ok": False, "reason": plan.reason, "plan": asdict(plan)}

    order = PaperOrderManager().build_bracket_preview(plan)
    policy = ExecutionPolicy(
        mode=payload.mode,
        account_size=settings.account_size,
        live_unlocked=payload.mode == "paper" or settings.live_execution_unlocked,
        live_acknowledged=payload.mode == "paper" or settings.live_execution_ack,
        manual_confirmed=True,
        kill_switch_active=False,
        audit_log_ready=True,
        broker_reconciled=True,
        account_reconciled=True,
    )
    result = LiveExecutor().prepare_alpaca_execution(plan, order, policy, dry_run=True)
    return {"plan": asdict(plan), "order": asdict(order), "execution": asdict(result)}


@api.post("/submit")
def submit(payload: SubmitRequest, x_admin_token: str | None = Header(default=None)) -> dict:
    require_admin(x_admin_token)
    if not settings.enable_submit_endpoint:
        raise HTTPException(status_code=403, detail="Submit endpoint is disabled.")
    if payload.mode == "live" and payload.confirm != LIVE_ORDER_CONFIRM:
        raise HTTPException(status_code=403, detail="Live order confirmation phrase required.")

    plan = build_plan(settings, payload.symbol, payload.entry, payload.stop, payload.target, payload.direction)
    if not plan.approved:
        return {"ok": False, "reason": plan.reason, "plan": asdict(plan)}

    order = PaperOrderManager().build_bracket_preview(plan)
    policy = ExecutionPolicy(
        mode=payload.mode,
        account_size=settings.account_size,
        live_unlocked=payload.mode == "paper" or settings.live_execution_unlocked,
        live_acknowledged=payload.mode == "paper" or settings.live_execution_ack,
        manual_confirmed=True,
        kill_switch_active=False,
        audit_log_ready=True,
        broker_reconciled=True,
        account_reconciled=True,
    )
    result = LiveExecutor().prepare_alpaca_execution(plan, order, policy, dry_run=False)
    return {"plan": asdict(plan), "order": asdict(order), "execution": asdict(result)}
