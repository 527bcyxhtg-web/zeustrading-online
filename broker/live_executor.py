from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Literal

from broker.alpaca_client import AlpacaClient, AlpacaOrderRequest
from broker.credentials import load_alpaca_credentials, validate_alpaca_credentials
from broker.order_manager import ExecutionGuard, ExecutionPolicy, PaperOrder
from risk.risk_manager import TradePlan


@dataclass(frozen=True)
class ExecutionResult:
    ok: bool
    mode: Literal["dry_run", "submitted", "blocked"]
    reason: str
    request: dict | None = None
    response: dict | None = None


class LiveExecutor:
    def __init__(self, guard: ExecutionGuard | None = None):
        self.guard = guard or ExecutionGuard()

    def prepare_alpaca_execution(
        self,
        plan: TradePlan,
        order: PaperOrder,
        policy: ExecutionPolicy,
        dry_run: bool = True,
    ) -> ExecutionResult:
        approved, reason = self.guard.approve_execution(plan, policy)
        if not approved:
            return ExecutionResult(False, "blocked", reason)

        credentials = load_alpaca_credentials(paper=policy.mode == "paper")
        credential_check = validate_alpaca_credentials(credentials)
        if not credential_check.ok:
            return ExecutionResult(False, "blocked", credential_check.reason)

        client = AlpacaClient(
            base_url=credentials.base_url,
            api_key=credentials.api_key,
            api_secret=credentials.api_secret,
            paper=credentials.paper,
        )
        request = client.build_order_request(order)
        if dry_run:
            return ExecutionResult(True, "dry_run", "Order prepared but not submitted.", asdict(request))

        response = client.submit_order(request)
        return ExecutionResult(True, "submitted", "Order submitted to broker.", asdict(request), response)
