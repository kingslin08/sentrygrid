"""Single source of truth for constants. Change numbers here, not in five files."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = ROOT / "models" / "sentrygrid.joblib"
METRICS_PATH = ROOT / "models" / "metrics.json"
DB_PATH = ROOT / "data" / "sentrygrid.db"

# --- timing -----------------------------------------------------------------
SIM_DT = 1.0           # one tick = 1 second of *simulated* plant time
TICK_SECONDS = 0.5     # real seconds between ticks in the live demo (2x speed)
WINDOW = 20            # ticks of history the model looks at
FS = 256               # vibration sampling rate (Hz) on the ESP32
BURST = 64             # vibration samples per tick

# --- classes ----------------------------------------------------------------
CLASSES = [
    "normal",
    "fault_overheating", "fault_imbalance", "fault_bearing",
    "attack_spoofing", "attack_replay", "attack_dos",
]
STATE_OF = {c: ("NORMAL" if c == "normal" else "FAULT" if c.startswith("fault") else "ATTACK")
            for c in CLASSES}
PRETTY = {
    "normal": "Normal operation",
    "fault_overheating": "Overheating fault",
    "fault_imbalance": "Rotor imbalance fault",
    "fault_bearing": "Bearing wear fault",
    "attack_spoofing": "Sensor spoofing",
    "attack_replay": "Replay attack",
    "attack_dos": "Denial of service",
}

# --- alert hysteresis (stops the dashboard flickering) -----------------------
CONFIRM_TICKS = 3      # same abnormal prediction N times in a row -> raise alert
CLEAR_TICKS = 6        # N normal predictions in a row -> resolve alert

# --- machines (the three from slide 1) --------------------------------------
# "rated_*" values are nameplate numbers the gateway would know up front.
MACHINES = [
    {"id": "pump-02",  "name": "Pump 02",  "rated_temp": 60.0, "rated_vib": 1.0, "rated_cur": 5.0,  "period": 90.0,  "phase": 0.0},
    {"id": "motor-07", "name": "Motor 07", "rated_temp": 75.0, "rated_vib": 1.4, "rated_cur": 12.0, "period": 120.0, "phase": 1.3},
    {"id": "valve-03", "name": "Valve 03", "rated_temp": 50.0, "rated_vib": 0.6, "rated_cur": 2.5,  "period": 75.0,  "phase": 2.1},
]
MACHINE_BY_ID = {m["id"]: m for m in MACHINES}
