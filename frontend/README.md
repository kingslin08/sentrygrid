# SentryGrid Frontend — Industrial IoT Cybersecurity & Fault Detection Console

**SentryGrid** is a state-of-the-art Industrial IoT Security Operations Center (SOC) command console. Built specifically for high-impact hackathon presentations, it provides real-time cross-layer intelligence distinguishing physical mechanical degradation from malicious cyber-tampering.

---

## ⚡ Quick Start (2 Terminals)

### Terminal 1: Python FastAPI Backend
Navigate to your backend directory and start the live simulation engine:
```bash
cd "C:\Users\G Kingslin Silvia\Desktop\sentrygrid\sentrygrid-backend"
.\.venv\Scripts\python.exe -m uvicorn sentrygrid.api:app --host 127.0.0.1 --port 8000 --reload
```
*API docs available at: http://127.0.0.1:8000/docs*

### Terminal 2: React Vite Frontend
In your frontend directory:
```bash
cd "C:\Users\G Kingslin Silvia\Desktop\front end\frontend"
npm run dev
```
*Console dashboard available at: http://localhost:5173*

---

## 🛠️ Technology Stack
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4 (Industrial Dark SOC Palette: `#070c16`, `#0e1d35`, Cyan `#06b6d4`, Electric Blue `#38bdf8`)
- **Visuals & Charts**: Recharts + Lucide React icons
- **Animations**: Framer Motion
- **Audio**: Web Audio API synthesized security chimes on critical attack detections

---

## 🛡️ Key Platform Modules

1. **SOC Command Center (`/overview`)**:
   - Plant-wide telemetry summary
   - 5 KPI summary metrics: Monitored Fleet, Healthy Assets, Fault States, Cyberattacks, Active Alerts
   - 3 Machine Fleet Cards: **Pump 02**, **Motor 07**, and **Valve 03**
   - Live Threat incident stream & Explainable AI spotlight

2. **Machine Telemetry Fleet (`/machines`)**:
   - Deep-dive into each machine asset
   - Real-time gauges for Temperature, Vibration RMS, Motor Current, and Network Packet Timing
   - Operational telemetry vs rated nameplate thresholds

3. **Sensor Waveform Analytics (`/analytics`)**:
   - 5 separate high-resolution Recharts:
     - Temperature (°C) with rated max threshold reference line
     - Vibration RMS with rated limit reference line
     - Motor Electrical Current (A)
     - Network Ingress Packet Rate (pkts/sec)
     - Packet Loss (%) and Arrival Latency Jitter (ms)
   - Interactive tooltips, CSV export, and raw readings inspector table

4. **Cyber & Fault Threat Center (`/threats`)**:
   - Visual disambiguation between:
     - **Cyberattacks**: Sensor Spoofing, Replay Attack, Denial of Service (DoS)
     - **Physical Faults**: Overheating, Rotor Imbalance, Bearing Wear
   - Live threat feed with detection latency and resolution status

5. **Explainable AI (XAI) (`/explainable-ai`)**:
   - SentryGrid's core differentiator
   - Natural language forensic diagnosis
   - Normalized feature impact bars (SHAP / Baseline deviation)
   - Granular z-score standard deviations from baseline (e.g., `temp_resid` +24.1σ)

6. **Scenario Simulation Control Panel (`/simulator`)**:
   - Interactive testing bench to demonstrate live on stage
   - Target machine selector, scenario choice, magnitude slider (0.5x to 2.0x)
   - One-click **Inject Test Scenario** and **Reset / Clear Scenario**

7. **Alert Investigation & Forensics (`/alerts`)**:
   - Chronological audit ledger from SQLite backend
   - Search by machine or keyword, filter by Active/Attack/Fault
   - Expandable forensic drawer displaying detection latency and feature evidence

8. **Model Performance Analytics (`/evaluation`)**:
   - Empirical evaluation on 5,090 held-out simulation windows:
     - 7-Class Overall Accuracy: **92.12%**
     - Detection Recall: **88.29%**
     - False Positive Rate: **0.00%**
     - Fault vs Attack Disambiguation: **98.89%**
   - Interactive 7x7 Confusion Matrix Heatmap with hover tooltips
   - Explicit **Synthetic-Data Evaluation** disclosure badge

9. **System Architecture (`/system`)**:
   - Visual 4-stage pipeline: Simulator → Residual Engine → Two-Stage ML → SQLite & WebSocket SOC
   - Full API endpoint documentation matrix

---

## 🏆 Hackathon Stage Presentation Script
1. **Introduction**: Open the **SOC Command Center**. Point out that all three machines are running normally within learned baseline physics.
2. **Inject Scenario**: Navigate to **Scenario Testbed**. Select **Valve 03**, choose **Sensor Spoofing**, set magnitude to **1.2x**, and click **INJECT TEST SCENARIO**.
3. **Observation**: Notice the instant toast notification, audio alert, and the Valve 03 card turning crimson **ATTACK**.
4. **The "Aha!" Moment**: Switch to **Explainable AI**. Show the judges that while sensed temperature spiked, motor current stayed flat, violating thermodynamic conservation laws. The AI caught this via `temp_resid` (+24σ) and labeled it an adversarial attack rather than a physical fault.
5. **Recovery**: Click **CLEAR SCENARIO**. Watch the 6-tick hysteresis resolve the alert automatically and return the fleet to green.
