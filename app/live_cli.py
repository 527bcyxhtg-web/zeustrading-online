from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict

from app.config import Settings, load_settings
from app.main import TradingAgent
from broker.alpaca_client import AlpacaClient
from broker.alpaca_reconciliation import fetch_alpaca_broker_state
from broker.credentials import LIVE_ACK_PHRASE, load_alpaca_credentials, validate_alpaca_credentials
from broker.live_executor import LiveExecutor
from broker.order_manager import ExecutionPolicy, PaperOrderManager
from broker.reconciliation import BrokerReconciler, BrokerState
from database.db import AgentDatabase
from risk.risk_manager import RiskConfig, RiskManager

LIVE_ORDER_CONFIRM = "I_CONFIRM_THIS_LIVE_ORDER"


def print_json(payload: dict) -> None:
    print(json.dumps(payload, indent=2, sort_keys=True))


def build_plan(settings: Settings, symbol: str, entry: float, stop: float, target: float, direction: str):
    return RiskManager(
        RiskConfig(
            account_size=settings.account_size,
            risk_per_trade=settings.risk_per_trade,
            max_daily_loss=settings.max_daily_loss,
            min_reward_risk=settings.min_reward_risk,
            max_trades_per_day=settings.max_trades_per_day,
            max_spread_percent=settings.max_spread_percent,
        )
    ).build_trade_plan(
        symbol=symbol,
        direction=direction,
        entry=entry,
        stop_loss=stop,
        target=target,
        trades_today=0,
        daily_pnl=0,
        spread_percent=0.03,
        news_risk="low",
    )


def command_preflight(args: argparse.Namespace) -> int:
    settings = load_settings()
    paper = args.mode == "paper"
    credentials = load_alpaca_credentials(paper=paper)
    credential_check = validate_alpaca_credentials(credentials)
    ack_ok = paper or settings.live_execution_ack

    payload = {
        "mode": args.mode,
        "credentials": asdict(credential_check),
        "live_acknowledged": ack_ok,
        "live_ack_required_value": LIVE_ACK_PHRASE if not paper else None,
        "endpoint": credentials.base_url,
        "ready": credential_check.ok and ack_ok,
    }
    print_json(payload)
    return 0 if payload["ready"] else 2


def command_scan(args: argparse.Namespace) -> int:
    result = TradingAgent().scan_symbol(args.symbol)
    print_json(result)
    return 0


def command_reconcile(args: argparse.Namespace) -> int:
    credentials = load_alpaca_credentials(paper=args.mode == "paper")
    credential_check = validate_alpaca_credentials(credentials)
    if not credential_check.ok:
        print_json({"ok": False, "reason": credential_check.reason})
        return 2

    client = AlpacaClient(credentials.base_url, credentials.api_key, credentials.api_secret, credentials.paper)
    try:
        state = fetch_alpaca_broker_state(client)
    except Exception as exc:
        print_json({"ok": False, "reason": f"Broker reconciliation failed: {exc}"})
        return 2

    result = BrokerReconciler().check_ready_for_new_order(args.symbol, args.required_buying_power, state)
    print_json({"result": asdict(result), "state": asdict(state)})
    return 0 if result.ok else 2


def command_dry_run(args: argparse.Namespace) -> int:
    settings = load_settings()
    database = AgentDatabase(settings.database_path)
    database.migrate()
    plan = build_plan(settings, args.symbol, args.entry, args.stop, args.target, args.direction)
    if not plan.approved:
        payload = {"ok": False, "reason": plan.reason, "plan": asdict(plan)}
        database.audit("execution.dry_run.blocked", payload)
        print_json(payload)
        return 2

    order = PaperOrderManager().build_bracket_preview(plan)
    policy = ExecutionPolicy(
        mode=args.mode,
        account_size=settings.account_size,
        live_unlocked=args.mode == "paper" or settings.live_execution_unlocked,
        live_acknowledged=args.mode == "paper" or settings.live_execution_ack,
        manual_confirmed=True,
        kill_switch_active=False,
        audit_log_ready=True,
        broker_reconciled=True,
        account_reconciled=True,
    )
    result = LiveExecutor().prepare_alpaca_execution(plan, order, policy, dry_run=True)
    payload = {"plan": asdict(plan), "order": asdict(order), "execution": asdict(result)}
    database.audit("execution.dry_run", payload)
    print_json(payload)
    return 0 if result.ok else 2


def command_submit(args: argparse.Namespace) -> int:
    if args.mode != "paper" and args.confirm != LIVE_ORDER_CONFIRM:
        print_json({"ok": False, "reason": f"Live submit requires --confirm {LIVE_ORDER_CONFIRM}"})
        return 2

    settings = load_settings()
    database = AgentDatabase(settings.database_path)
    database.migrate()
    plan = build_plan(settings, args.symbol, args.entry, args.stop, args.target, args.direction)
    if not plan.approved:
        payload = {"ok": False, "reason": plan.reason, "plan": asdict(plan)}
        database.audit("execution.submit.blocked", payload)
        print_json(payload)
        return 2

    order = PaperOrderManager().build_bracket_preview(plan)
    policy = ExecutionPolicy(
        mode=args.mode,
        account_size=settings.account_size,
        live_unlocked=args.mode == "paper" or settings.live_execution_unlocked,
        live_acknowledged=args.mode == "paper" or settings.live_execution_ack,
        manual_confirmed=True,
        kill_switch_active=False,
        audit_log_ready=True,
        broker_reconciled=True,
        account_reconciled=True,
    )
    result = LiveExecutor().prepare_alpaca_execution(plan, order, policy, dry_run=False)
    payload = {"plan": asdict(plan), "order": asdict(order), "execution": asdict(result)}
    database.audit("execution.submit", payload)
    print_json(payload)
    return 0 if result.ok else 2


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Prop Research Lab live/paper execution CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    preflight = subparsers.add_parser("preflight")
    preflight.add_argument("--mode", choices=["paper", "live"], default="paper")
    preflight.set_defaults(func=command_preflight)

    scan = subparsers.add_parser("scan")
    scan.add_argument("--symbol", default="AMD")
    scan.set_defaults(func=command_scan)

    reconcile = subparsers.add_parser("reconcile")
    reconcile.add_argument("--mode", choices=["paper", "live"], default="paper")
    reconcile.add_argument("--symbol", default="AMD")
    reconcile.add_argument("--required-buying-power", type=float, default=0.0)
    reconcile.set_defaults(func=command_reconcile)

    dry_run = subparsers.add_parser("dry-run")
    dry_run.add_argument("--mode", choices=["paper", "live"], default="paper")
    dry_run.add_argument("--symbol", default="AMD")
    dry_run.add_argument("--direction", choices=["LONG", "SHORT"], default="LONG")
    dry_run.add_argument("--entry", type=float, required=True)
    dry_run.add_argument("--stop", type=float, required=True)
    dry_run.add_argument("--target", type=float, required=True)
    dry_run.set_defaults(func=command_dry_run)

    submit = subparsers.add_parser("submit")
    submit.add_argument("--mode", choices=["paper", "live"], default="paper")
    submit.add_argument("--symbol", required=True)
    submit.add_argument("--direction", choices=["LONG", "SHORT"], default="LONG")
    submit.add_argument("--entry", type=float, required=True)
    submit.add_argument("--stop", type=float, required=True)
    submit.add_argument("--target", type=float, required=True)
    submit.add_argument("--confirm", default="")
    submit.set_defaults(func=command_submit)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
