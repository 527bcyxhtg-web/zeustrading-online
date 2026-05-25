from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any


SCHEMA = """
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL,
  setup TEXT NOT NULL,
  approved INTEGER NOT NULL,
  payload TEXT NOT NULL
);
"""


class AgentDatabase:
    def __init__(self, path: str):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.path)
        conn.execute("PRAGMA journal_mode=WAL")
        return conn

    def migrate(self) -> None:
        with self.connect() as conn:
            conn.executescript(SCHEMA)

    def audit(self, event_type: str, payload: dict[str, Any]) -> None:
        with self.connect() as conn:
            conn.execute(
                "INSERT INTO audit_log (event_type, payload) VALUES (?, ?)",
                (event_type, json.dumps(payload, sort_keys=True)),
            )

    def save_signal(self, symbol: str, direction: str, setup: str, approved: bool, payload: dict[str, Any]) -> None:
        with self.connect() as conn:
            conn.execute(
                "INSERT INTO signals (symbol, direction, setup, approved, payload) VALUES (?, ?, ?, ?, ?)",
                (symbol, direction, setup, int(approved), json.dumps(payload, sort_keys=True)),
            )
