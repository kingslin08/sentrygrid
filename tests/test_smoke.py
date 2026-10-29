import numpy as np
from sentrygrid.config import MACHINES, WINDOW
from sentrygrid.features import extract_features
from sentrygrid.simulator import Machine


def run(kind=None, n=80):
    m = Machine(MACHINES[0], np.random.default_rng(1))
    out = []
    for i in range(n):
        if kind and i == 40:
            m.inject(kind)
        out.append(m.step())
    return out


def test_spoofing_changes_wire_not_physics():
    r = run("attack_spoofing")
    assert abs(r[70]["temp"] - r[70]["phys_temp"]) > 5          # wire lies
    assert abs(r[10]["temp"] - r[10]["phys_temp"]) < 1e-9       # honest before attack


def test_fault_moves_physics():
    r = run("fault_overheating")
    assert r[75]["phys_temp"] > r[30]["phys_temp"] + 10


def test_feature_vector_shape():
    f = extract_features(run()[-WINDOW:], MACHINES[0])
    assert "temp_maxjump" in f and "dup_ratio" in f and len(f) > 25
