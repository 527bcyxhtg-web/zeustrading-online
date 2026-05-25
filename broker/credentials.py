from __future__ import annotations

import os
from dataclasses import dataclass


LIVE_ACK_PHRASE = "I_ACCEPT_LIVE_RISK"


@dataclass(frozen=True)
class AlpacaCredentials:
    api_key: str
    api_secret: str
    base_url: str
    paper: bool


@dataclass(frozen=True)
class CredentialCheck:
    ok: bool
    reason: str


def load_alpaca_credentials(paper: bool = True) -> AlpacaCredentials:
    if paper:
        api_key = os.getenv("ALPACA_PAPER_API_KEY", os.getenv("ALPACA_API_KEY", ""))
        api_secret = os.getenv("ALPACA_PAPER_API_SECRET", os.getenv("ALPACA_API_SECRET", ""))
        base_url = os.getenv("ALPACA_PAPER_BASE_URL", "https://paper-api.alpaca.markets")
    else:
        api_key = os.getenv("ALPACA_LIVE_API_KEY", "")
        api_secret = os.getenv("ALPACA_LIVE_API_SECRET", "")
        base_url = os.getenv("ALPACA_LIVE_BASE_URL", "https://api.alpaca.markets")

    return AlpacaCredentials(api_key=api_key, api_secret=api_secret, base_url=base_url.rstrip("/"), paper=paper)


def validate_alpaca_credentials(credentials: AlpacaCredentials) -> CredentialCheck:
    if not credentials.api_key or not credentials.api_secret:
        return CredentialCheck(False, "Missing Alpaca API key/secret.")

    if credentials.paper and "paper-api.alpaca.markets" not in credentials.base_url:
        return CredentialCheck(False, "Paper mode must use the Alpaca paper endpoint.")

    if not credentials.paper and "paper-api.alpaca.markets" in credentials.base_url:
        return CredentialCheck(False, "Live mode cannot use the Alpaca paper endpoint.")

    return CredentialCheck(True, "Credentials look consistent.")


def live_acknowledged() -> bool:
    return os.getenv("LIVE_EXECUTION_ACK", "") == LIVE_ACK_PHRASE
