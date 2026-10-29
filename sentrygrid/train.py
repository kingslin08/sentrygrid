"""python -m sentrygrid.train  — generate data, train, evaluate on UNSEEN scenarios, save."""
from __future__ import annotations
import argparse, json, time
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import GroupShuffleSplit

from . import dataset
from .config import CLASSES, METRICS_PATH, MODEL_PATH, STATE_OF
from .model import SentryModel


def main(n_per_class: int = 40, seed: int = 0, quiet: bool = False) -> dict:
    t0 = time.time()
    df = dataset.generate(n_per_class, seed)
    log = (lambda *a: None) if quiet else print
    log(f"dataset: {len(df)} windows, {df.group.nunique()} scenarios  ({time.time() - t0:.0f}s)")

    tr, te = next(GroupShuffleSplit(1, test_size=0.3, random_state=seed).split(df, groups=df.group))
    train, test = df.iloc[tr], df.iloc[te]          # split by SCENARIO -> no leakage
    model = SentryModel().fit(train)
    pred = model.predict_df(test)["pred"].to_numpy()
    y = test.label.to_numpy()

    st = lambda a: np.array([STATE_OF[c] for c in a])
    normal = y == "normal"
    metrics = {
        "n_train": int(len(train)), "n_test": int(len(test)),
        "false_positive_rate": float((pred[normal] != "normal").mean()),
        "detection_recall": float((pred[~normal] != "normal").mean()),
        "three_state_accuracy": float((st(pred) == st(y)).mean()),
        "seven_class_accuracy": float((pred == y).mean()),
        "fault_vs_attack_accuracy_on_detected": float(
            (st(pred)[(~normal) & (pred != "normal")] == st(y)[(~normal) & (pred != "normal")]).mean()),
        "confusion_matrix": {"labels": CLASSES, "matrix": confusion_matrix(y, pred, labels=CLASSES).tolist()},
    }
    log(classification_report(y, pred, labels=CLASSES, digits=3, zero_division=0))
    log(json.dumps({k: round(v, 3) for k, v in metrics.items() if isinstance(v, float)}, indent=2))
    model.save(MODEL_PATH)
    METRICS_PATH.write_text(json.dumps(metrics, indent=2))
    log(f"saved -> {MODEL_PATH}  ({time.time() - t0:.0f}s total)")
    return metrics


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=40, help="scenarios per class")
    ap.add_argument("--seed", type=int, default=0)
    a = ap.parse_args()
    main(a.n, a.seed)
