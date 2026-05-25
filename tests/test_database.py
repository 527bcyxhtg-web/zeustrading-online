from database.db import AgentDatabase


def test_database_migrates_and_saves_signal(tmp_path):
    db = AgentDatabase(str(tmp_path / "agent.sqlite3"))
    db.migrate()
    db.audit("test.event", {"ok": True})
    db.save_signal("AMD", "LONG", "VWAP reclaim", True, {"approved": True})

    with db.connect() as conn:
        audit_count = conn.execute("SELECT COUNT(*) FROM audit_log").fetchone()[0]
        signal_count = conn.execute("SELECT COUNT(*) FROM signals").fetchone()[0]

    assert audit_count == 1
    assert signal_count == 1
