import os

from app.live_cli import main


def test_live_cli_preflight_blocks_missing_credentials():
    old_env = dict(os.environ)
    try:
        os.environ.clear()
        code = main(["preflight", "--mode", "live"])
        assert code == 2
    finally:
        os.environ.clear()
        os.environ.update(old_env)


def test_live_cli_dry_run_with_mock_live_credentials(tmp_path):
    old_env = dict(os.environ)
    try:
        os.environ.clear()
        os.environ["DATABASE_PATH"] = str(tmp_path / "agent.sqlite3")
        os.environ["BROKER_MODE"] = "live"
        os.environ["RISK_PER_TRADE"] = "0.001"
        os.environ["LIVE_EXECUTION_UNLOCKED"] = "true"
        os.environ["LIVE_EXECUTION_ACK"] = "I_ACCEPT_LIVE_RISK"
        os.environ["ALPACA_LIVE_API_KEY"] = "key"
        os.environ["ALPACA_LIVE_API_SECRET"] = "secret"
        os.environ["ALPACA_LIVE_BASE_URL"] = "https://api.alpaca.markets"
        code = main(["dry-run", "--mode", "live", "--symbol", "AMD", "--entry", "100", "--stop", "99", "--target", "102"])
        assert code == 0
    finally:
        os.environ.clear()
        os.environ.update(old_env)
