from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class TelegramMessage:
    text: str
    enabled: bool


class TelegramNotifier:
    def __init__(self, bot_token: str = "", chat_id: str = ""):
        self.bot_token = bot_token
        self.chat_id = chat_id

    def build_message(self, text: str) -> TelegramMessage:
        enabled = bool(self.bot_token and self.chat_id)
        return TelegramMessage(text=text, enabled=enabled)
