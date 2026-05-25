from broker.alpaca_client import AlpacaClient
from broker.credentials import AlpacaCredentials, validate_alpaca_credentials
from broker.ibkr_client import IbkrClient, IbkrConnectionConfig
from broker.order_manager import PaperOrder


def test_alpaca_bracket_request_uses_paper_endpoint():
    order = PaperOrder("AMD", "buy", 50, "limit", 100, 99, 102, False, "prl-amd-test", "2026-01-01T00:00:00Z")
    request = AlpacaClient("https://paper-api.alpaca.markets", paper=True).build_order_request(order)

    assert request.paper is True
    assert request.endpoint.endswith("/v2/orders")
    assert request.payload["order_class"] == "bracket"
    assert request.payload["stop_loss"]["stop_price"] == "99"
    assert request.payload["client_order_id"] == "prl-amd-test"


def test_ibkr_bracket_preview_never_transmits_by_default():
    order = PaperOrder("AMD", "buy", 50, "limit", 100, 99, 102, False, "prl-amd-test", "2026-01-01T00:00:00Z")
    preview = IbkrClient(IbkrConnectionConfig()).build_bracket_preview(order, next_order_id=1000)

    assert preview.parent["transmit"] is False
    assert preview.take_profit["parentId"] == 1000
    assert preview.stop_loss["orderType"] == "STP"
    assert preview.stop_loss["transmit"] is False


def test_ibkr_bracket_preview_can_mark_last_child_transmit_for_live():
    order = PaperOrder("AMD", "buy", 50, "limit", 100, 99, 102, False, "prl-amd-test", "2026-01-01T00:00:00Z")
    preview = IbkrClient(IbkrConnectionConfig()).build_bracket_preview(order, next_order_id=1000, transmit=True)

    assert preview.parent["transmit"] is False
    assert preview.take_profit["transmit"] is False
    assert preview.stop_loss["transmit"] is True


def test_live_alpaca_credentials_reject_paper_endpoint():
    check = validate_alpaca_credentials(
        AlpacaCredentials("key", "secret", "https://paper-api.alpaca.markets", paper=False)
    )

    assert check.ok is False
