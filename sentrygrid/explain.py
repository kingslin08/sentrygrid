"""Evidence, not a score (slide 3). Uses SHAP if installed; otherwise baseline-deviation x importance."""
from __future__ import annotations
import numpy as np
import pandas as pd

from .config import PRETTY

# feature -> (human label, unit hint)
LABELS = {
    "temp_resid": "Temperature vs. what vibration and current predict",
    "vib_rms_resid": "Vibration vs. what temperature and current predict",
    "current_resid": "Current vs. what temperature and vibration predict",
    "temp_end": "Temperature", "vib_rms_end": "Vibration level", "current_end": "Motor current",
    "temp_maxjump": "Largest single-step temperature jump",
    "temp_slope": "Temperature trend", "vib_rms_slope": "Vibration trend", "current_slope": "Current trend",
    "band_lo": "Vibration at rotation frequency", "band_mid": "Vibration at 2x frequency",
    "band_hi": "High-frequency (bearing-band) vibration", "hi_ratio": "Share of high-frequency vibration",
    "interval_mean": "Packet interval", "interval_std": "Packet-interval irregularity",
    "pkt_rate": "Packet rate", "loss": "Packet loss", "ts_skew": "Timestamp lag",
    "payload_mean": "Payload size", "dup_ratio": "Repeated identical readings",
    "corr_temp_vib": "Temperature-vibration coupling", "corr_temp_cur": "Temperature-current coupling",
    "corr_vib_cur": "Vibration-current coupling",
    "temp_mean": "Mean temperature", "vib_rms_mean": "Mean vibration", "current_mean": "Mean current",
    "temp_std": "Temperature variability", "vib_rms_std": "Vibration variability", "current_std": "Current variability",
}
PHYSICAL = {"temp": "temp_end", "Vibration": "vib_rms_end", "Current": "current_end"}


class Explainer:
    def __init__(self, model):
        self.m = model
        self.importance = pd.Series(model.rf.feature_importances_, index=model.cols)
        self._shap = None
        try:
            import shap  # noqa
            self._shap = shap.TreeExplainer(model.rf)
        except Exception:
            self._shap = None

    def _contrib(self, feats: dict, kind: str) -> pd.Series:
        m = self.m
        x = pd.DataFrame([feats])[m.cols]
        if self._shap is not None:
            try:
                sv = self._shap.shap_values(x)
                ci = list(m.rf.classes_).index(kind)
                vals = sv[ci][0] if isinstance(sv, list) else np.asarray(sv)[0, :, ci]
                return pd.Series(vals, index=m.cols)
            except Exception:
                pass
        z = (x.iloc[0] - m.baseline_mean) / m.baseline_std
        return z.abs() * self.importance

    def explain(self, pred: dict) -> dict:
        m, feats, kind = self.m, pred["features"], pred["kind"]
        if kind == "normal":
            return {"evidence": [], "text": "All signals are moving together within the learnt baseline."}
        z = (pd.Series(feats)[m.cols] - m.baseline_mean) / m.baseline_std
        contrib = self._contrib(feats, kind).abs().sort_values(ascending=False)
        evidence = []
        for name in contrib.index[:4]:
            zz = float(z[name])
            direction = "above" if zz > 0 else "below"
            evidence.append({"feature": name, "label": LABELS.get(name, name), "z": round(zz, 1),
                             "value": round(float(feats[name]), 3), "impact": round(float(contrib[name]), 4),
                             "sentence": f"{LABELS.get(name, name)} is {('>10' if abs(zz) > 10 else format(abs(zz), '.1f'))} sigma {direction} baseline"})
        calm = [lab for lab, f in (("Vibration", "vib_rms_end"), ("Current", "current_end"), ("Temperature", "temp_end"))
                if abs(float(z[f])) < 1.2]
        t_res = feats["temp_resid"] / max(1e-6, self.m.physics.expected(feats, "temp"))
        parts = []
        if abs(t_res) > 0.08:
            parts.append(f"Temperature deviated {abs(t_res) * 100:.0f}% from expected")
        parts += [f"{c} unchanged" for c in calm if c != "Temperature" or abs(t_res) <= 0.08][:2]
        if abs(float(z["interval_std"])) > 3:
            parts.append("Packet interval irregular")
        if abs(float(z["ts_skew"])) > 3:
            parts.append("Timestamps stale")
        if abs(float(z["dup_ratio"])) > 3:
            parts.append("Readings repeating")
        if abs(float(z["loss"])) > 3 or abs(float(z["pkt_rate"])) > 3:
            parts.append("Packet flood / loss")
        if not parts:
            parts = [e["sentence"] for e in evidence[:2]]
        text = f"{'. '.join(parts)}.  →  {PRETTY[kind]}, {pred['confidence'] * 100:.0f}% confidence."
        return {"evidence": evidence, "text": text}
