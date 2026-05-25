from data.news_data import NewsFilter, NewsItem


def test_news_filter_blocks_high_impact_terms():
    risk = NewsFilter().assess("AMD", [NewsItem("AMD", "AMD earnings today after close", "mock")])

    assert risk.level == "high"
    assert "earnings" in risk.reason


def test_news_filter_allows_quiet_headlines():
    risk = NewsFilter().assess("AMD", [NewsItem("AMD", "AMD product update", "mock")])

    assert risk.level == "low"
