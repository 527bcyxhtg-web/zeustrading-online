from broker.reconciliation import BrokerOpenOrder, BrokerReconciler, BrokerState


def test_reconciler_blocks_disconnected_broker():
    result = BrokerReconciler().check_ready_for_new_order("AMD", 1000, BrokerState(False, 10_000))

    assert result.ok is False
    assert result.reason == "Broker disconnected."


def test_reconciler_blocks_existing_open_order():
    state = BrokerState(True, 10_000, open_orders=(BrokerOpenOrder("AMD", 10, "buy", "abc"),))

    result = BrokerReconciler().check_ready_for_new_order("AMD", 1000, state)

    assert result.ok is False
    assert result.reason == "Open order already exists for symbol."
