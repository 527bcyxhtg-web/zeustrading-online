from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone


@dataclass(frozen=True)
class CalendarEvent:
    name: str
    starts_at: datetime
    impact: str


class EconomicCalendar:
    def __init__(self, events: list[CalendarEvent] | None = None):
        self.events = events or []

    def has_blocking_event(self, now: datetime | None = None, minutes_before: int = 15) -> tuple[bool, str]:
        now = now or datetime.now(timezone.utc)
        window_end = now + timedelta(minutes=minutes_before)
        for event in self.events:
            if event.impact == "high" and now <= event.starts_at <= window_end:
                return True, f"High-impact event soon: {event.name}."
        return False, "No blocking macro event."
