"""Turn a window of raw readings into the features the model learns from.

Three families: (1) per-signal stats, (2) cross-signal coupling, (3) network metadata.
The 'physics expectation' fits temp ~ vib + current on NORMAL data only, so a residual means
"this signal disagrees with what the other two say" — the heart of fault-vs-attack.
"""
from __future__ import annotations
import numpy as np
import pandas as pd

SIGNALS = ["temp", "vib_rms", "current"]


def _slope(y: np.ndarray) -> float:
    x = np.arange(len(y)) - (len(y) - 1) / 2
    return float((x * (y - y.mean())).sum() / (x ** 2).sum())


def _corr(a: np.ndarray, b: np.ndarray) -> float:
    if a.std() < 1e-9 or b.std() < 1e-9:
        return 0.0
    return float(np.corrcoef(a, b)[0, 1])


def extract_features(window: list[dict], profile: dict) -> dict:
    rated = {"temp": profile["rated_temp"], "vib_rms": profile["rated_vib"], "current": profile["rated_cur"]}
    arr = {s: np.array([r[s] for r in window]) / rated[s] for s in SIGNALS}
    f: dict[str, float] = {}
    for s in SIGNALS:
        a = arr[s]
        f[f"{s}_mean"], f[f"{s}_std"], f[f"{s}_slope"] = float(a.mean()), float(a.std()), _slope(a)
        f[f"{s}_end"] = float(a[-5:].mean())
    f["corr_temp_vib"] = _corr(arr["temp"], arr["vib_rms"])
    f["corr_temp_cur"] = _corr(arr["temp"], arr["current"])
    f["corr_vib_cur"] = _corr(arr["vib_rms"], arr["current"])
    f["temp_maxjump"] = float(np.abs(np.diff(arr["temp"])).max())

    rv2 = profile["rated_vib"] ** 2 / profile["rated_vib"] ** 2  # bands already normalised in simulator
    lo, mid, hi = (np.mean([r[k] for r in window]) * rv2 for k in ("band_lo", "band_mid", "band_hi"))
    f["band_lo"], f["band_mid"], f["band_hi"] = float(lo), float(mid), float(hi)
    f["hi_ratio"] = float(hi / (lo + mid + hi + 1e-9))

    net = lambda k: np.array([r[k] for r in window], dtype=float)
    f["interval_mean"], f["interval_std"] = float(net("interval_ms").mean()), float(net("interval_ms").std())
    f["pkt_rate"], f["loss"] = float(net("pkt_rate").mean()), float(net("loss").mean())
    f["ts_skew"], f["payload_mean"] = float(net("ts_skew_ms").mean()), float(net("payload_bytes").mean())
    raw_t = np.round([r["temp"] for r in window], 6)
    f["dup_ratio"] = float(1 - len(np.unique(raw_t)) / len(raw_t))
    return f


class PhysicsExpectation:
    """Linear 'what should this signal be, given the other two' model, fitted on normal data."""
    TARGETS = {"temp": ("vib_rms", "current"), "vib_rms": ("temp", "current"), "current": ("temp", "vib_rms")}

    def __init__(self):
        self.coef: dict[str, np.ndarray] = {}

    def fit(self, df: pd.DataFrame):
        for tgt, (a, b) in self.TARGETS.items():
            X = np.c_[np.ones(len(df)), df[f"{a}_end"], df[f"{b}_end"]]
            self.coef[tgt] = np.linalg.lstsq(X, df[f"{tgt}_end"].to_numpy(), rcond=None)[0]
        return self

    def expected(self, feats: dict, tgt: str) -> float:
        a, b = self.TARGETS[tgt]
        c = self.coef[tgt]
        return float(c[0] + c[1] * feats[f"{a}_end"] + c[2] * feats[f"{b}_end"])

    def add(self, feats: dict) -> dict:
        for tgt in self.TARGETS:
            feats[f"{tgt}_resid"] = feats[f"{tgt}_end"] - self.expected(feats, tgt)
        return feats

    def add_df(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        for tgt, (a, b) in self.TARGETS.items():
            c = self.coef[tgt]
            df[f"{tgt}_resid"] = df[f"{tgt}_end"] - (c[0] + c[1] * df[f"{a}_end"] + c[2] * df[f"{b}_end"])
        return df
