export interface ScenarioDetail {
  kind: string;
  name: string;
  category: 'FAULT' | 'ATTACK';
  icon: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  mechanism: string;
  signature: string;
  mitigation: string;
}

export const SCENARIO_DETAILS: Record<string, ScenarioDetail> = {
  fault_overheating: {
    kind: 'fault_overheating',
    name: 'Overheating Fault',
    category: 'FAULT',
    icon: 'Flame',
    severity: 'HIGH',
    description: 'Physical thermodynamic dissipation breakdown causing progressive temperature rise.',
    mechanism: 'Physical thermal ramp driven by excessive friction or cooling system obstruction. Motor current and temperature maintain correlated thermodynamic trajectory.',
    signature: 'Gradual thermal rise (temp_slope > 0), physical temperature matching sensed temperature, persistent current coupling.',
    mitigation: 'Throttle workload, inspect coolant flow rates, verify thermal dissipation fan operation.',
  },
  fault_imbalance: {
    kind: 'fault_imbalance',
    name: 'Rotor Imbalance Fault',
    category: 'FAULT',
    icon: 'Activity',
    severity: 'MEDIUM',
    description: 'Mass eccentricity on the rotating shaft inducing 1X rotational frequency harmonics.',
    mechanism: 'Uneven mass distribution produces centrifugal forces proportional to rotation speed squared. Induces strong low-frequency vibration.',
    signature: 'Elevated low-frequency vibration peak (band_lo), increased vibration RMS, intact network telemetry.',
    mitigation: 'Schedule mechanical dynamic rotor balancing and inspect coupling alignment.',
  },
  fault_bearing: {
    kind: 'fault_bearing',
    name: 'Bearing Wear Fault',
    category: 'FAULT',
    icon: 'Disc',
    severity: 'HIGH',
    description: 'Micro-spalling and raceway surface degradation producing high-frequency impact bursts.',
    mechanism: 'Rolling elements strike surface defects at ball-pass frequencies, generating acoustic emissions and high-frequency resonance.',
    signature: 'High-frequency vibration spike (band_hi), elevated hi_ratio (>0.45), normal network packet timings.',
    mitigation: 'Inspect bearing lubrication, prepare replacement bearing assembly during next maintenance window.',
  },
  attack_spoofing: {
    kind: 'attack_spoofing',
    name: 'Sensor Spoofing Attack',
    category: 'ATTACK',
    icon: 'ShieldAlert',
    severity: 'CRITICAL',
    description: 'Adversary injects falsified telemetry readings onto the sensor bus or network link.',
    mechanism: 'Injected packets report abnormal thermal or vibration levels, but coupled physical variables (motor current, heat transfer) remain unchanged. Violates physical conservation laws.',
    signature: 'High temperature/vibration residual (temp_resid / vib_rms_resid), uncoupled current, packet timestamp irregularity.',
    mitigation: 'Isolate compromised sensor gateway, verify cryptographic MAC/HMAC signatures, switch to backup sensor channel.',
  },
  attack_replay: {
    kind: 'attack_replay',
    name: 'Replay Attack',
    category: 'ATTACK',
    icon: 'Repeat',
    severity: 'CRITICAL',
    description: 'Adversary re-transmits captured legitimate telemetry to conceal physical sabotage or degradation.',
    mechanism: 'Recorded historical packets are re-injected into the network stream. The plant appears healthy while physical conditions drift unnoticed.',
    signature: 'Duplicate packet payload ratio (dup_ratio > 0.8), zero signal entropy, stale timestamp lag (ts_skew_ms > 0).',
    mitigation: 'Enforce anti-replay nonce validation, rolling cryptokeys, and millisecond-precision synchronized timestamps.',
  },
  attack_dos: {
    kind: 'attack_dos',
    name: 'Denial of Service (DoS)',
    category: 'ATTACK',
    icon: 'WifiOff',
    severity: 'CRITICAL',
    description: 'Network packet flood saturating industrial gateway buffers, delaying safety-critical control signals.',
    mechanism: 'High-volume synthetic traffic exhausts microcontroller network buffers, inducing severe transmission latency and packet dropping.',
    signature: 'Surge in packet rate (pkt_rate > 3x normal), extreme packet loss (loss > 40%), irregular packet arrival intervals (interval_std > 50ms).',
    mitigation: 'Activate hardware rate limiting on gateway switch port, block rogue IP/MAC sources, isolate OT subnet.',
  },
};
