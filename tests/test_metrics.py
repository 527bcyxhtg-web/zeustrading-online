from backtesting.metrics import expectancy, max_drawdown, profit_factor


def test_expectancy_formula():
    assert expectancy(0.45, 120, 60) == 21


def test_profit_factor():
    assert round(profit_factor([120, -60, 80, -40]), 2) == 2.0


def test_max_drawdown():
    assert round(max_drawdown([10_000, 10_200, 9_900, 10_300]), 4) == -0.0294
