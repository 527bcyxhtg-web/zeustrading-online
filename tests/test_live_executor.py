import os

from broker.live_executor import LiveExecutor
from broker.order_manager import ExecutionPolicy, PaperOrderManager
from risk.risk_manager import RiskConfig, RiskManager


def test_live_executor_prepares_dry_run_request_with_valid_live_env():
    old_env = dict(os.environ)
    try:
        os.environ["ALPACA_LIVE_API_KEY"] = "key"
        os.environ["ALPACA_LIVE_API_SECRET"] = "secret"
        os.environ["ALPACA_LIVE_BASE_URL"] = "https://api.alpaca.markets"
        plan = RiskManager(RiskConfig(account_size=10_000, risk_per_trade=0.001)).build_trade_plan(
            symbol="AMD",
            direction="LONG",
            entry=100,
            stop_loss=99,
            target=102,
            trades_today=0,
            daily_pnl=0,
        )
        order = PaperOrderManager().build_bracket_preview(plan)
        policy = ExecutionPolicy(
            mode="live",
            account_size=10_000,
            live_unlocked=True,
            live_acknowledged=True,
            manual_confirmed=True,
            audit_log_ready=True,
            broker_reconciled=True,
            account_reconciled=True,
        )

        result = LiveExecutor().prepare_alpaca_execution(plan, order, policy, dry_run=True)

        assert result.ok is True
        assert result.mode == "dry_run"
        assert result.request["payload"]["order_class"] == "bracket"
    finally:
        os.environ.clear()
        os.environ.update(old_env)
