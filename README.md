# SentryGrid Backend (simulated IoT)

Tells equipment **failure** apart from **cyberattack** — and shows the evidence.
Implements Phases 1–2 of the pitch deck in software (no hardware needed).

```
Machine simulator ──► window (20 s) ──► features ──► Stage 1: Isolation Forest ──► Stage 2: Random Forest
 physical layer (truth)                  physics      "is something wrong?"          "which fault/attack?"
 wire layer (attackable)                 residuals                                        │
                                                                         SHAP / baseline-deviation evidence
                                                                                          ▼
                                      SQLite  ◄── hysteresis (3 to raise, 6 to clear) ──► FastAPI + WebSocket ──► dashboard
```

## Run it (5 commands)
```bash
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m sentrygrid.train            # ~30 s: generates data, trains, prints metrics
python -m sentrygrid.demo             # scripted attack/fault run in the terminal (stage fallback!)
uvicorn sentrygrid.api:app --reload   # live API, docs at http://localhost:8000/docs
```

## API
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/machines` | live state of every machine (tile data) |
| GET | `/api/machines/{id}/history?n=120` | trend data for charts |
| GET | `/api/alerts` | alert feed with evidence + detection latency |
| POST | `/api/inject` `{"machine_id":"valve-03","kind":"attack_spoofing"}` | trigger a scenario live on stage |
| POST | `/api/clear/{id}` | stop the scenario |
| GET | `/api/scenarios`, `/api/metrics` | scenario list, held-out evaluation |
| WS | `/ws` | pushes `status`, `alert`, `resolved` events every tick |

Scenario kinds: `fault_overheating`, `fault_imbalance`, `fault_bearing`, `attack_spoofing`, `attack_replay`, `attack_dos`.

## Where each slide claim lives in the code
| Slide claim | File |
|---|---|
| Physics couples signals; attacks only touch the wire | `simulator.py` |
| Cross-layer correlation, FFT bands, packet timing | `features.py` |
| Synthetic attack data pipeline | `dataset.py` |
| Two-stage model | `model.py` |
| Explainable alerts (SHAP) | `explain.py` |
| SQLite audit trail | `store.py` |
| Detection latency metric | `engine.py` (`latency_s`) |

## GitHub
```bash
git init && git add . && git commit -m "SentryGrid backend simulation"
git branch -M main
git remote add origin https://github.com/<you>/sentrygrid.git
git push -u origin main
# teammate: git clone <url>   later: git pull
```

## Be honest on stage (your deck already is)
All numbers come from **synthetic** data split by scenario (no leakage). Say "simulated" every time. Known weak spot: slow
overheating faults are detected later than attacks because a gradual ramp looks normal at first.
