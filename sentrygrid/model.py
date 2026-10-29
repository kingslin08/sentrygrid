"""Two-stage model (slide 3): Isolation Forest flags the anomaly, Random Forest names it."""
from __future__ import annotations
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier

from .config import CLASSES, PRETTY, STATE_OF
from .features import PhysicsExpectation

META = {"label", "group", "machine"}
# Stage 1 looks only at features that carry anomaly signal; 40 noisy dims would drown it out.
STAGE1_COLS = ["temp_resid", "vib_rms_resid", "current_resid", "temp_maxjump", "hi_ratio", "band_hi",
               "band_lo", "interval_std", "interval_mean", "ts_skew", "loss", "pkt_rate", "dup_ratio",
               "payload_mean", "temp_slope"]


class SentryModel:
    def __init__(self, seed: int = 7):
        self.seed = seed
        self.physics = PhysicsExpectation()
        self.cols: list[str] = []
        self.iforest: IsolationForest | None = None
        self.threshold = 0.0
        self.rf: RandomForestClassifier | None = None
        self.baseline_mean: pd.Series | None = None
        self.baseline_std: pd.Series | None = None

    # ---- training -----------------------------------------------------------
    def fit(self, df: pd.DataFrame, alert_percentile: float = 3.0):
        normal = df[df.label == "normal"]
        self.physics.fit(normal)
        df = self.physics.add_df(df)
        self.cols = [c for c in df.columns if c not in META]
        normal = df[df.label == "normal"]

        self.baseline_mean = normal[self.cols].mean()
        self.baseline_std = normal[self.cols].std().clip(lower=1e-6)
        z = self._z(normal)
        self.iforest = IsolationForest(n_estimators=300, random_state=self.seed, n_jobs=-1).fit(z)
        self.threshold = float(np.percentile(self.iforest.score_samples(z), alert_percentile))

        # Stage 2 also sees 'normal', so a stage-1 false alarm gets corrected instead of mislabelled.
        self.rf = RandomForestClassifier(n_estimators=300, min_samples_leaf=2, class_weight="balanced",
                                         random_state=self.seed, n_jobs=-1).fit(df[self.cols], df.label)
        self.rf.n_jobs = 1          # single-thread inference is faster for 1-row predictions
        return self

    def _z(self, X: pd.DataFrame) -> pd.DataFrame:
        c = STAGE1_COLS
        return (X[c] - self.baseline_mean[c]) / self.baseline_std[c]

    # ---- inference ----------------------------------------------------------
    def predict_features(self, feats: dict) -> dict:
        feats = self.physics.add(dict(feats))
        x = pd.DataFrame([feats])[self.cols]
        score = float(self.iforest.score_samples(self._z(x))[0])
        out = {"features": feats, "anomaly_score": score, "kind": "normal", "state": "NORMAL",
               "confidence": 0.97, "proba": {}}
        if score >= self.threshold:
            return out
        proba = self.rf.predict_proba(x)[0]
        proba_d = dict(zip(self.rf.classes_, map(float, proba)))
        kind = max(proba_d, key=proba_d.get)
        out.update(kind=kind, state=STATE_OF[kind], confidence=proba_d[kind], proba=proba_d)
        return out

    def predict_df(self, df: pd.DataFrame) -> pd.DataFrame:
        """Vectorised version used for evaluation."""
        d = self.physics.add_df(df)
        scores = self.iforest.score_samples(self._z(d))
        kinds = np.array(["normal"] * len(d), dtype=object)
        flag = scores < self.threshold
        if flag.any():
            kinds[flag] = self.rf.predict(d.loc[flag, self.cols])
        return pd.DataFrame({"pred": kinds, "score": scores})

    def save(self, path):
        joblib.dump(self, path)

    @staticmethod
    def load(path) -> "SentryModel":
        return joblib.load(path)
