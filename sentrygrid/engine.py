"""The gateway brain: simulate -> window -> features -> model -> hysteresis -> alert -> store."""
from __future__ import annotations
import time
from collections import deque
import numpy as np

from .config import (CLEAR_TICKS, CONFIRM_TICKS, MACHINES, MACHINE_BY_ID, PRETTY, SIM_DT, WINDOW)
from .explain import Explainer
from .features import extract_features
from .model import SentryModel
from .simulator import Machine
from .store import Store


class _Tracker:
    """Debounce: an alert needs CONFIRM_TICKS identical predictions; clearing needs CLEAR_TICKS normals."""
    def __init__(self):
        self.cand, self.count = "normal", 0
        self.kind, self.alert_id = "normal", None


class Engine:
    def __init__(self, model: SentryModel, store: Store | None = None, seed: int = 42):
        self.model, self.store = model, store or Store()
        self.explainer = Explainer(model)
        rng = np.random.default_rng(seed)
        self.machines = {m["id"]: Machine(m, np.random.default_rng(rng.integers(1 << 31))) for m in MACHINES}
        self.windows = {m["id"]: deque(maxlen=WINDOW) for m in MACHINES}
        self.trackers = {m["id"]: _Tracker() for m in MACHINES}
        self.status = {m["id"]: self._blank(m) for m in MACHINES}
        self.t_inject: dict[str, int] = {}

    @staticmethod
    def _blank(m):
        return {"machine_id": m["id"], "name": m["name"], "state": "WARMUP", "kind": "warming_up",
                "label": "Learning baseline", "confidence": 0.0, "text": "Collecting first window of data.",
                "evidence": [], "reading": None, "alert_id": None}

    # ---- control ------------------------------------------------------------
    def inject(self, machine_id: str, kind: str, magnitude: float = 1.0):
        m = self.machines[machine_id]
        m.inject(kind, magnitude)
        self.t_inject[machine_id] = m.tick

    def clear(self, machine_id: str):
        self.machines[machine_id].clear()
        self.t_inject.pop(machine_id, None)

    # ---- one simulated second for the whole plant ---------------------------
    def step(self) -> list[dict]:
        events = []
        for mid, m in self.machines.items():
            reading = m.step()
            win = self.windows[mid]
            win.append(reading)
            st = self.status[mid]
            st["reading"] = {k: reading[k] for k in ("tick", "t", "temp", "vib_rms", "current", "interval_ms",
                                                      "pkt_rate", "loss", "ts_skew_ms", "label", "phys_temp")}
            if len(win) < WINDOW:
                continue
            feats = extract_features(list(win), MACHINE_BY_ID[mid])
            pred = self.model.predict_features(feats)
            self.store.add_reading(reading, pred)

            ex = self.explainer.explain(pred)
            tr = self._debounce(mid, pred, ex, reading, events)
            st.update(state=tr["state"], kind=tr["kind"],
                      label=PRETTY.get(tr["kind"], tr["kind"]), confidence=pred["confidence"],
                      text=tr["text"], evidence=tr["evidence"], alert_id=tr["alert_id"],
                      raw_kind=pred["kind"], anomaly_score=pred["anomaly_score"])
            events.append({"type": "status", "machine_id": mid, **st})
        self.store.commit()
        return events

    def _debounce(self, mid, pred, ex, reading, events) -> dict:
        from .config import STATE_OF
        tr = self.trackers[mid]
        if pred["kind"] == tr.cand:
            tr.count += 1
        else:
            tr.cand, tr.count = pred["kind"], 1

        need = CLEAR_TICKS if tr.cand == "normal" else CONFIRM_TICKS
        if tr.count >= need and tr.cand != tr.kind:
            if tr.alert_id is not None:
                self.store.resolve_alert(tr.alert_id)
                events.append({"type": "resolved", "machine_id": mid, "alert_id": tr.alert_id})
                tr.alert_id = None
            tr.kind = tr.cand
            if tr.kind != "normal":
                latency = None
                if mid in self.t_inject:
                    latency = (reading["tick"] - self.t_inject[mid]) * SIM_DT
                alert = {"machine_id": mid, "ts": time.time(), "state": STATE_OF[tr.kind], "kind": tr.kind,
                         "confidence": pred["confidence"], "text": ex["text"], "evidence": ex["evidence"],
                         "latency_s": latency}
                tr.alert_id = self.store.add_alert(alert)
                events.append({"type": "alert", "alert_id": tr.alert_id, **alert})
        # the tile shows the confirmed state; live evidence while an alert is open
        kind = tr.kind
        return {"kind": kind, "state": STATE_OF[kind], "alert_id": tr.alert_id,
                "text": ex["text"] if kind != "normal" else "All signals are moving together within the learnt baseline.",
                "evidence": ex["evidence"] if kind != "normal" else []}

    def snapshot(self) -> list[dict]:
        return list(self.status.values())
