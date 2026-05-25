from risk.risk_manager import RiskConfig, RiskManager


def test_approved_trade_plan_sizes_from_risk():
    manager = RiskManager(RiskConfig(account_size=10_000, risk_per_trade=0.005))

    plan = manager.build_trade_plan(
        symbol="AMD",
        direction="LONG",
        entry=100,
        stop_loss=99,
        target=102,
        trades_today=0,
        daily_pnl=0,
        spread_percent=0.03,
        news_risk="low",
    )

    assert plan.approved is True
    assert plan.position_size == 50
    assert plan.risk_amount == 50
    assert plan.reward_risk == 2


def test_rejects_high_news_risk():
    manager = RiskManager(RiskConfig(account_size=10_000))

    plan = manager.build_trade_plan(
        symbol="TSLA",
        direction="LONG",
        entry=100,
        stop_loss=99,
        target=103,
        trades_today=0,
        daily_pnl=0,
        news_risk="high",
    )

    assert plan.approved is False
    assert plan.reason == "High-impact news risk."


def test_rejects_daily_loss_limit():
    manager = RiskManager(RiskConfig(account_size=10_000, max_daily_loss=0.015))

    plan = manager.build_trade_plan(
        symbol="NVDA",
        direction="LONG",
        entry=100,
        stop_loss=99,
        target=103,
        trades_today=0,
        daily_pnl=-151,
    )

    assert plan.approved is False
    assert plan.reason == "Daily loss limit reached."
