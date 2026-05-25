from __future__ import annotations

from dataclasses import dataclass


HIGH_IMPACT_TERMS = {
    "cpi",
    "fomc",
    "nfp",
    "rate decision",
    "earnings",
    "sec",
    "lawsuit",
    "investigation",
    "downgrade",
}


@dataclass(frozen=True)
class NewsItem:
    symbol: str
    title: str
    source: str
    sentiment: str = "neutral"


@dataclass(frozen=True)
class NewsRisk:
    level: str
    reason: str
    items: tuple[NewsItem, ...]


class NewsFilter:
    def assess(self, symbol: str, items: list[NewsItem]) -> NewsRisk:
        relevant = [item for item in items if item.symbol.upper() in {symbol.upper(), "MARKET"}]
        joined = " ".join(item.title.lower() for item in relevant)
        matched = sorted(term for term in HIGH_IMPACT_TERMS if term in joined)

        if matched:
            return NewsRisk("high", f"High-impact term detected: {', '.join(matched)}.", tuple(relevant))

        if any(item.sentiment == "negative" for item in relevant):
            return NewsRisk("medium", "Negative headline present.", tuple(relevant))

        return NewsRisk("low", "No high-impact headline detected.", tuple(relevant))
