"""python -m sentrygrid.demo  — scripted run, no server needed. Your fallback if Wi-Fi dies on stage."""
from __future__ import annotations
import argparse, time
from .config import MODEL_PATH, TICK_SECONDS
from .engine import Engine
from .model import SentryModel

SCRIPT = [  # (tick, action, machine, kind)
    (60,  "inject", "valve-03", "attack_spoofing"),
    (110, "clear",  "valve-03", None),
    (140, "inject", "motor-07", "fault_bearing"),
    (200, "clear",  "motor-07", None),
    (230, "inject", "pump-02",  "attack_replay"),
    (290, "clear",  "pump-02",  None),
    (320, "inject", "pump-02",  "attack_dos"),
    (360, "clear",  "pump-02",  None),
]
END = 400


def main(realtime: bool = False):
    eng = Engine(SentryModel.load(MODEL_PATH))
    plan = {t: (a, m, k) for t, a, m, k in SCRIPT}
    for tick in range(END):
        if tick in plan:
            a, m, k = plan[tick]
            print(f"\n[t={tick:>3}s] >>> {'INJECT ' + k if a == 'inject' else 'CLEAR'} on {m}")
            eng.inject(m, k) if a == "inject" else eng.clear(m)
        for ev in eng.step():
            if ev["type"] == "alert":
                lat = f"  (detected {ev['latency_s']:.0f}s after injection)" if ev["latency_s"] is not None else "  (FALSE ALARM)"
                print(f"[t={tick:>3}s] 🚨 {ev['state']:<6} {ev['machine_id']:<9} {ev['text']}{lat}")
            elif ev["type"] == "resolved":
                print(f"[t={tick:>3}s] ✅ resolved alert on {ev['machine_id']}")
        if realtime:
            time.sleep(TICK_SECONDS)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--realtime", action="store_true")
    main(ap.parse_args().realtime)
