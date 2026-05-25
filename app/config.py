from __future__ import annotations

import os
from dataclasses import dataclass

from app.env import load_dotenv


@dataclass(frozen=True)
class Settings:
    environment: str = "local"
    broker_mode: str = "paper"
    account_size: float = 10_000.0
    risk_per_trade: float = 0.005
    max_daily_loss: float = 0.015
    max_trades_per_day: int = 3
    min_reward_risk: float = 2.0
    max_spread_percent: float = 0.08
    live_execution_unlocked: bool = False
    live_execution_ack: bool = False
    database_path: str = "database/trading_agent.sqlite3"
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    alpaca_base_url: str = "https://paper-api.alpaca.markets"
    ibkr_host: str = "127.0.0.1"
    ibkr_port: int = 7497
    ibkr_client_id: int = 11
    api_admin_token: str = ""
    enable_submit_endpoint: bool = False
    cors_origins: str = ""


def load_settings() -> Settings:
    load_dotenv()
    return Settings(
        environment=os.getenv("TRADING_ENV", "local"),
        broker_mode=os.getenv("BROKER_MODE", "paper"),
        account_size=float(os.getenv("ACCOUNT_SIZE", "10000")),
        risk_per_trade=float(os.getenv("RISK_PER_TRADE", "0.005")),
        max_daily_loss=float(os.getenv("MAX_DAILY_LOSS", "0.015")),
        max_trades_per_day=int(os.getenv("MAX_TRADES_PER_DAY", "3")),
        min_reward_risk=float(os.getenv("MIN_REWARD_RISK", "2.0")),
        max_spread_percent=float(os.getenv("MAX_SPREAD_PERCENT", "0.08")),
        live_execution_unlocked=os.getenv("LIVE_EXECUTION_UNLOCKED", "false").lower() == "true",
        live_execution_ack=os.getenv("LIVE_EXECUTION_ACK", "") == "I_ACCEPT_LIVE_RISK",
        database_path=os.getenv("DATABASE_PATH", "database/trading_agent.sqlite3"),
        telegram_bot_token=os.getenv("TELEGRAM_BOT_TOKEN", ""),
        telegram_chat_id=os.getenv("TELEGRAM_CHAT_ID", ""),
        alpaca_base_url=os.getenv("ALPACA_BASE_URL", "https://paper-api.alpaca.markets"),
        ibkr_host=os.getenv("IBKR_HOST", "127.0.0.1"),
        ibkr_port=int(os.getenv("IBKR_PORT", "7497")),
        ibkr_client_id=int(os.getenv("IBKR_CLIENT_ID", "11")),
        api_admin_token=os.getenv("API_ADMIN_TOKEN", ""),
        enable_submit_endpoint=os.getenv("ENABLE_SUBMIT_ENDPOINT", "false").lower() == "true",
        cors_origins=os.getenv("CORS_ORIGINS", ""),
    )
