"""Physics-coupled sensor simulator.

Key idea (slide 4): a real fault moves temperature, vibration and current TOGETHER because
physics couples them through machine load. An attack only changes what travels on the WIRE.
So every Machine keeps two layers:
    physical layer -> the truth (never shown to the model)
    wire layer     -> what the gateway receives (what the model sees)
"""
from __future__ import annotations
from collections import deque
from dataclasses import dataclass
import numpy as np

from .config import BURST, FS, SIM_DT

FAULTS = {"fault_overheating", "fault_imbalance", "fault_bearing"}
ATTACKS = {"attack_spoofing", "attack_replay", "attack_dos"}
WIRE_KEYS = ("temp", "vib_rms", "current", "band_lo", "band_mid", "band_hi")


@dataclass
class Scenario:
    kind: str
    start_tick: int
    magnitude: float = 1.0
    stealth: float = 0.5      # 0 = noisy attacker, 1 = careful attacker
    ramp: int = 20            # ticks for a fault to reach full severity
    spoof_ramp: bool = False  # spoof offset appears gradually instead of as a step


class Machine:
    def __init__(self, profile: dict, rng: np.random.Generator):
        self.p = profile
        self.rng = rng
        self.tick = 0
        self.scenario: Scenario | None = None
        self._load_noise = 0.0
        self._load_step = 0.0
        self._temp_state = profile["rated_temp"] * 0.75
        self._wire_hist: deque = deque(maxlen=40)
        self._replay_buf: list | None = None
        self._last_wire: dict | None = None

    # ---- control ------------------------------------------------------------
    def inject(self, kind: str, magnitude: float = 1.0, stealth: float | None = None):
        if kind not in FAULTS | ATTACKS:
            raise ValueError(f"unknown scenario: {kind}")
        s = Scenario(kind, self.tick, magnitude,
                     self.rng.uniform(0, 1) if stealth is None else stealth,
                     spoof_ramp=bool(self.rng.random() < 0.4))
        self.scenario = s
        self._replay_buf = None
        if kind == "attack_replay" and len(self._wire_hist) >= 10:
            self._replay_buf = list(self._wire_hist)[-10:]

    def clear(self):
        self.scenario = None
        self._replay_buf = None

    # ---- one tick -----------------------------------------------------------
    def step(self) -> dict:
        p, rng = self.p, self.rng
        t = self.tick * SIM_DT
        sc = self.scenario

        # shared latent driver: machine load (slow cycle + noise + occasional production steps)
        self._load_noise = 0.9 * self._load_noise + rng.normal(0, 0.03)
        if rng.random() < 0.012:
            self._load_step = rng.uniform(-0.2, 0.2)
        self._load_step *= 0.97
        load = float(np.clip(0.5 + 0.3 * np.sin(2 * np.pi * t / p["period"] + p["phase"])
                             + self._load_noise + self._load_step, 0.05, 1.0))

        sev = 0.0
        fault = sc.kind if sc and sc.kind in FAULTS else None
        if fault:
            sev = min(1.0, max(0.0, (self.tick - sc.start_tick) / sc.ramp)) * sc.magnitude

        # ---- physical layer ---------------------------------------------------
        rt, rv, rc = p["rated_temp"], p["rated_vib"], p["rated_cur"]
        target = rt * (0.62 + 0.28 * load)
        a1 = rv * (0.55 + 0.5 * load) * 0.9       # 1x rotation (25 Hz)
        a2 = 0.25 * rv * (0.6 + 0.4 * load)       # 2x (50 Hz)
        a3 = 0.10 * rv                             # bearing band (90 Hz)
        cur = rc * (0.5 + 0.55 * load)
        if fault == "fault_overheating":
            target += 0.42 * rt * sev; cur += 0.10 * rc * sev; a1 *= 1 + 0.10 * sev
        elif fault == "fault_imbalance":
            a1 *= 1 + 1.6 * sev; cur += 0.12 * rc * sev; target += 0.07 * rt * sev
        elif fault == "fault_bearing":
            a3 += 0.8 * rv * sev; a1 *= 1 + 0.15 * sev; target += 0.17 * rt * sev; cur += 0.18 * rc * sev
        self._temp_state += 0.25 * (target - self._temp_state)      # thermal lag
        phys_temp = self._temp_state + rng.normal(0, 0.0025 * rt)
        cur += rng.normal(0, 0.01 * rc)

        tt = np.arange(BURST) / FS
        ph = rng.uniform(0, 2 * np.pi, 3)
        w = (a1 * np.sin(2 * np.pi * 25 * tt + ph[0]) + a2 * np.sin(2 * np.pi * 50 * tt + ph[1])
             + a3 * np.sin(2 * np.pi * 90 * tt + ph[2]) + rng.normal(0, 0.05 * rv, BURST))
        vib_rms = float(np.sqrt(np.mean(w ** 2)))
        spec = (np.abs(np.fft.rfft(w)) / BURST * 2) ** 2
        fr = np.fft.rfftfreq(BURST, 1 / FS)
        band = lambda lo, hi: float(spec[(fr >= lo) & (fr < hi)].sum() / rv ** 2)

        wire = {"temp": float(phys_temp), "vib_rms": vib_rms, "current": float(cur),
                "band_lo": band(10, 40), "band_mid": band(40, 70), "band_hi": band(70, 110)}

        # ---- network layer (normal) ------------------------------------------
        net = {"interval_ms": 1000 + rng.normal(0, 25), "pkt_rate": 1 + rng.normal(0, 0.03),
               "loss": 0.0, "ts_skew_ms": 15 + rng.normal(0, 8), "payload_bytes": 64 + rng.integers(-2, 3)}
        if rng.random() < 0.005:
            net["loss"] = 1.0

        if not sc or sc.kind not in ATTACKS:
            self._wire_hist.append(dict(wire))       # only clean data is recordable for replay

        # ---- attack layer (touches ONLY the wire) -----------------------------
        if sc and sc.kind in ATTACKS:
            k = self.tick - sc.start_tick
            if sc.kind == "attack_spoofing":
                f = min(1.0, (k + 1) / 10) if sc.spoof_ramp else 1.0
                wire["temp"] += f * sc.magnitude * rt * (0.22 + 0.1 * (sc.start_tick % 3))
                net["interval_ms"] = 1000 + rng.normal(0, 25 + (1 - sc.stealth) * 320)
                net["payload_bytes"] = 64 + rng.integers(-2, 3)
            elif sc.kind == "attack_replay":
                if self._replay_buf:
                    wire = dict(self._replay_buf[k % len(self._replay_buf)])
                    if sc.stealth < 0.5:   # sloppy replayer leaves stale timestamps
                        net["ts_skew_ms"] = 9000 + rng.normal(0, 300)
                    net["interval_ms"] = 1000 + rng.normal(0, 30)
            elif sc.kind == "attack_dos":
                net["interval_ms"] = abs(rng.normal(90, 60)) + 5
                net["pkt_rate"] = rng.uniform(8, 20) * sc.magnitude
                net["ts_skew_ms"] = 400 + rng.normal(0, 150)
                net["payload_bytes"] = 64 + rng.integers(-20, 60)
                if rng.random() < 0.35 + 0.3 * min(1, sc.magnitude):
                    net["loss"] = 1.0

        if net["loss"] and self._last_wire:         # dropped packet -> gateway keeps stale value
            wire = dict(self._last_wire)
        self._last_wire = dict(wire)

        reading = {"machine_id": self.p["id"], "tick": self.tick, "t": t, **wire, **net,
                   "label": sc.kind if sc else "normal", "phys_temp": float(phys_temp), "load": load}
        self.tick += 1
        return reading
