"""Synthetic dataset generator (slide 4, point 4): normal + 3 faults + 3 attacks, labelled."""
from __future__ import annotations
from collections import deque
import numpy as np
import pandas as pd

from .config import CLASSES, MACHINES, WINDOW
from .features import extract_features
from .simulator import Machine

LABEL_DELAY = 10      # skip the ambiguous first ticks after an event starts
RUN_TICKS = 150


def generate(n_per_class: int = 40, seed: int = 0, stride: int = 2) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    rows, gid = [], 0
    for kind in CLASSES:
        for _ in range(n_per_class):
            prof = MACHINES[rng.integers(len(MACHINES))]
            m = Machine(prof, np.random.default_rng(rng.integers(1 << 31)))
            start = int(rng.integers(45, 65))
            win: deque = deque(maxlen=WINDOW)
            for tick in range(RUN_TICKS):
                if kind != "normal" and tick == start:
                    m.inject(kind, magnitude=float(rng.uniform(0.7, 1.3)))
                win.append(m.step())
                if len(win) < WINDOW or tick % stride:
                    continue
                if kind == "normal" or tick < start:
                    label = "normal"
                elif tick >= start + LABEL_DELAY:
                    label = kind
                else:
                    continue
                f = extract_features(list(win), prof)
                f.update(label=label, group=gid, machine=prof["id"])
                rows.append(f)
            gid += 1
    return pd.DataFrame(rows)
