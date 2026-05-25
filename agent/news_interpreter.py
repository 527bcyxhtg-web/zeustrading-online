from __future__ import annotations

from data.news_data import NewsRisk


def summarize_news_risk(risk: NewsRisk) -> str:
    if risk.level == "high":
        return f"NO TRADE news filter: {risk.reason}"
    if risk.level == "medium":
        return f"Caution: {risk.reason}"
    return "News filter clear."
