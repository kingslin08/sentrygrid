/**
 * SentryGrid Core Data Types
 * Aligned with SentryGrid FastAPI backend models and SQLite schema
 */

export type MachineState = 'NORMAL' | 'FAULT' | 'ATTACK' | 'WARMUP' | 'UNKNOWN';

export type MachineId = 'pump-02' | 'motor-07' | 'valve-03';

export interface SensorReading {
  tick: number;
  t: number;
  temp: number;
  vib_rms: number;
  current: number;
  interval_ms: number;
  pkt_rate: number;
  loss?: number;
  ts_skew_ms?: number;
  label?: string;
  phys_temp?: number;
}

export interface FeatureEvidence {
  feature: string;
  label: string;
  z: number;
  value: number;
  impact: number;
  sentence: string;
}

export interface MachineSnapshot {
  machine_id: string;
  name: string;
  state: MachineState;
  kind: string;
  label: string;
  confidence: number;
  text: string;
  evidence: FeatureEvidence[];
  alert_id: number | null;
  raw_kind?: string;
  anomaly_score?: number;
  reading?: SensorReading | null;
}

export interface HistoryReading {
  id: number;
  machine_id: string;
  tick: number;
  ts: number;
  temp: number;
  vib_rms: number;
  current: number;
  interval_ms: number;
  pkt_rate: number;
  state: MachineState;
  kind: string;
  confidence: number;
  truth: string;
  // Computed client-side for visualization
  loss?: number;
  skew?: number;
}

export interface SecurityAlert {
  id: number;
  machine_id: string;
  ts: number;
  state: MachineState;
  kind: string;
  confidence: number;
  text: string;
  evidence: FeatureEvidence[];
  latency_s: number | null;
  resolved_ts: number | null;
}

export interface ScenarioOption {
  kind: string;
  label: string;
}

export interface ConfusionMatrixData {
  labels: string[];
  matrix: number[][];
}

export interface ModelMetrics {
  n_train: number;
  n_test: number;
  false_positive_rate: number;
  detection_recall: number;
  three_state_accuracy: number;
  seven_class_accuracy: number;
  fault_vs_attack_accuracy_on_detected: number;
  confusion_matrix: ConfusionMatrixData;
}

export interface MachineMeta {
  id: string;
  name: string;
  type: string;
  location: string;
  rated_temp: number;
  rated_vib: number;
  rated_cur: number;
  period: number;
  phase: number;
  description: string;
}

export interface WsEvent {
  type: 'status' | 'alert' | 'resolved';
  machine_id?: string;
  alert_id?: number;
  [key: string]: any;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'alert';
  title: string;
  message: string;
  timestamp: number;
}

export type ActiveTab = 
  | 'overview' 
  | 'machines' 
  | 'analytics' 
  | 'threats' 
  | 'explainable-ai' 
  | 'simulator' 
  | 'alerts' 
  | 'evaluation' 
  | 'system';
