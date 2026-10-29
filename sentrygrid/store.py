"""SQLite storage (slide 6: 'InfluxDB / SQLite'). Zero setup, survives restarts, replayable for audits."""
from __future__ import annotations
import json, sqlite3, threading, time

SCHEMA = """
CREATE TABLE IF NOT EXISTS readings(
  id INTEGER PRIMARY KEY, machine_id TEXT, tick INTEGER, ts REAL,
  temp REAL, vib_rms REAL, current REAL, interval_ms REAL, pkt_rate REAL,
  state TEXT, kind TEXT, confidence REAL, truth TEXT);
CREATE INDEX IF NOT EXISTS ix_r ON readings(machine_id, id);
CREATE TABLE IF NOT EXISTS alerts(
  id INTEGER PRIMARY KEY, machine_id TEXT, ts REAL, state TEXT, kind TEXT, confidence REAL,
  text TEXT, evidence TEXT, latency_s REAL, resolved_ts REAL);
"""


class Store:
    def __init__(self, path=":memory:"):
        self.db = sqlite3.connect(str(path), check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.lock = threading.Lock()
        with self.lock:
            self.db.executescript(SCHEMA)

    def add_reading(self, r: dict, pred: dict):
        with self.lock:
            self.db.execute(
                "INSERT INTO readings(machine_id,tick,ts,temp,vib_rms,current,interval_ms,pkt_rate,state,kind,confidence,truth)"
                " VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
                (r["machine_id"], r["tick"], time.time(), r["temp"], r["vib_rms"], r["current"], r["interval_ms"],
                 r["pkt_rate"], pred["state"], pred["kind"], pred["confidence"], r["label"]))

    def add_alert(self, a: dict) -> int:
        with self.lock:
            cur = self.db.execute(
                "INSERT INTO alerts(machine_id,ts,state,kind,confidence,text,evidence,latency_s) VALUES(?,?,?,?,?,?,?,?)",
                (a["machine_id"], a["ts"], a["state"], a["kind"], a["confidence"], a["text"],
                 json.dumps(a["evidence"]), a.get("latency_s")))
            self.db.commit()
            return cur.lastrowid

    def resolve_alert(self, alert_id: int):
        with self.lock:
            self.db.execute("UPDATE alerts SET resolved_ts=? WHERE id=?", (time.time(), alert_id))
            self.db.commit()

    def commit(self):
        with self.lock:
            self.db.commit()

    def history(self, machine_id: str, n: int = 120) -> list[dict]:
        with self.lock:
            rows = self.db.execute("SELECT * FROM readings WHERE machine_id=? ORDER BY id DESC LIMIT ?",
                                   (machine_id, n)).fetchall()
        return [dict(r) for r in reversed(rows)]

    def alerts(self, limit: int = 50) -> list[dict]:
        with self.lock:
            rows = self.db.execute("SELECT * FROM alerts ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
        out = []
        for r in rows:
            d = dict(r); d["evidence"] = json.loads(d["evidence"]); out.append(d)
        return out
