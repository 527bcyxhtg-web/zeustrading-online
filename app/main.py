from __future__ import annotations

from dataclasses import asdict

from agent.news_interpreter import summarize_news_risk
from agent.signal_explainer import explain_trade_plan
from app.config import Settings, load_settings
from broker.order_manager import ExecutionGuard, ExecutionPolicy, PaperOrderManager
from broker.reconciliation import BrokerReconciler, BrokerState
from data.market_data import MockMarketDataClient
from data.news_data import NewsFilter, NewsItem
from database.db import AgentDatabase
from risk.kill_switch import KillSwitch
from risk.risk_manager import RiskConfig, RiskManager
from strategies.ema_momentum import generate_ema_momentum_signal
from strategies.opening_range_breakout import generate_opening_range_breakout_signal


class TradingAgent:
    def __init__(self, settings: Settings | None = None):
        self.settings = settings or load_settings()
        self.market_data = MockMarketDataClient()
        self.news_filter = NewsFilter()
        self.risk = RiskManager(
            RiskConfig(
                account_size=self.settings.account_size,
                risk_per_trade=self.settings.risk_per_trade,
                max_daily_loss=self.settings.max_daily_loss,
                min_reward_risk=self.settings.min_reward_risk,
                max_trades_per_day=self.settings.max_trades_per_day,
                max_spread_percent=self.settings.max_spread_percent,
            )
        )
        self.database = AgentDatabase(self.settings.database_path)
        self.execution_guard = ExecutionGuard()
        self.reconciler = BrokerReconciler()

    def scan_symbol(self, symbol: str, trades_today: int = 0, daily_pnl: float = 0.0) -> dict:
        self.database.migrate()
        snapshot = self.market_data.snapshot(symbol)
        news = self.news_filter.assess(symbol, [NewsItem("MARKET", "No high-impact event detected", "mock")])
        candidates = [
            generate_ema_momentum_signal(snapshot, news.level),
            generate_opening_range_breakout_signal(snapshot, news.level),
        ]
        candidate = next((item for item in candidates if item), None)

        if candidate is None:
            payload = {"symbol": symbol.upper(), "decision": "wait", "reason": "No valid setup."}
            self.database.audit("scan.wait", payload)
            return payload

        plan = self.risk.build_trade_plan(
            candidate.symbol,
            candidate.direction,
            candidate.entry,
            candidate.stop_loss,
            candidate.target,
            trades_today=trades_today,
            daily_pnl=daily_pnl,
            spread_percent=candidate.spread_percent,
            news_risk=news.level,
        )
        kill_switch = KillSwitch().evaluate(
            daily_pnl=daily_pnl,
            max_daily_loss_amount=self.settings.account_size * self.settings.max_daily_loss,
            broker_connected=True,
        )
        order_preview = PaperOrderManager().build_bracket_preview(plan) if plan.approved else None
        required_buying_power = candidate.entry * plan.position_size if plan.approved else 0
        reconciliation = self.reconciler.check_ready_for_new_order(
            candidate.symbol,
            required_buying_power,
            BrokerState(connected=True, buying_power=self.settings.account_size * 2),
        )
        policy = ExecutionPolicy(
            mode=self.settings.broker_mode,
            account_size=self.settings.account_size,
            live_unlocked=self.settings.live_execution_unlocked,
            live_acknowledged=self.settings.live_execution_ack,
            manual_confirmed=False,
            kill_switch_active=kill_switch.active,
            audit_log_ready=True,
            broker_reconciled=reconciliation.ok,
            account_reconciled=reconciliation.ok,
        )
        execution_ok, execution_reason = self.execution_guard.approve_execution(plan, policy)
        explanation = explain_trade_plan(
            plan,
            candidate.setup,
            candidate.market_context,
            news.level,
            candidate.volume_relative,
            candidate.rsi,
        )

        payload = {
            "candidate": asdict(candidate),
            "risk_plan": asdict(plan),
            "news": {"level": news.level, "summary": summarize_news_risk(news)},
            "kill_switch": asdict(kill_switch),
            "reconciliation": asdict(reconciliation),
            "execution": {"approved": execution_ok, "reason": execution_reason},
            "order_preview": asdict(order_preview) if order_preview else None,
            "explanation": explanation,
        }
        self.database.save_signal(candidate.symbol, candidate.direction, candidate.setup, plan.approved, payload)
        self.database.audit("scan.signal", payload)
        return payload


if __name__ == "__main__":
    result = TradingAgent().scan_symbol("AMD")
    print(result["explanation"])
