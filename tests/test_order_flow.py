from agent.signal_explainer import explain_trade_plan
from broker.order_manager import ExecutionGuard, ExecutionPolicy, PaperOrderManager
from risk.risk_manager import RiskConfig, RiskManager


def test_approved_plan_can_build_paper_order_preview():
    plan = RiskManager(RiskConfig(account_size=10_000)).build_trade_plan(
        symbol="AMD",
        direction="LONG",
        entry=100,
        stop_loss=99,
        target=102,
        trades_today=0,
        daily_pnl=0,
    )

    order = PaperOrderManager().build_bracket_preview(plan)

    assert order.symbol == "AMD"
    assert order.side == "buy"
    assert order.qty == 50
    assert order.transmit is False
    assert order.client_order_id.startswith("prl-amd-")


def test_explainer_blocks_rejected_plan():
    plan = RiskManager(RiskConfig(account_size=10_000)).build_trade_plan(
        symbol="TSLA",
        direction="LONG",
        entry=100,
        stop_loss=99,
        target=101.5,
        trades_today=0,
        daily_pnl=0,
    )

    message = explain_trade_plan(plan, "VWAP reclaim", "QQQ weak", "low")

    assert message.startswith("NO TRADE")


def test_live_execution_requires_unlocks():
    plan = RiskManager(RiskConfig(account_size=10_000, risk_per_trade=0.001)).build_trade_plan(
        symbol="AMD",
        direction="LONG",
        entry=100,
        stop_loss=99,
        target=102,
        trades_today=0,
        daily_pnl=0,
    )

    approved, reason = ExecutionGuard().approve_execution(plan, ExecutionPolicy(mode="live", account_size=10_000))

    assert approved is False
    assert reason == "Live trading is locked."


def test_controlled_live_execution_can_be_approved():
    plan = RiskManager(RiskConfig(account_size=10_000, risk_per_trade=0.001)).build_trade_plan(
        symbol="AMD",
        direction="LONG",
        entry=100,
        stop_loss=99,
        target=102,
        trades_today=0,
        daily_pnl=0,
    )
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

    approved, reason = ExecutionGuard().approve_execution(plan, policy)

    assert approved is True
    assert reason == "Controlled live execution approved."
