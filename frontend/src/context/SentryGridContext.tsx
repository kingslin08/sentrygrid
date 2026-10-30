import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { api, SentryWebSocketClient } from '../api/client';
import type {
  HistoryReading,
  MachineSnapshot,
  ModelMetrics,
  ScenarioOption,
  SecurityAlert,
  ToastMessage,
  WsEvent,
} from '../types/sentrygrid';

interface SentryGridContextType {
  machines: MachineSnapshot[];
  selectedMachineId: string;
  setSelectedMachineId: (id: string) => void;
  activeMachine: MachineSnapshot | undefined;
  alerts: SecurityAlert[];
  history: Record<string, HistoryReading[]>;
  scenarios: ScenarioOption[];
  metrics: ModelMetrics | null;
  backendConnected: boolean;
  wsConnected: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  tickCount: number;
  audioAlertsEnabled: boolean;
  setAudioAlertsEnabled: (enabled: boolean) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  injectScenario: (machineId: string, kind: string, magnitude?: number) => Promise<boolean>;
  clearScenario: (machineId: string) => Promise<boolean>;
  refreshAll: () => Promise<void>;
  fetchHistoryForMachine: (machineId: string, n?: number) => Promise<void>;
}

const SentryGridContext = createContext<SentryGridContextType | undefined>(undefined);

// Web Audio synthesizer for alert sound effects
function playSecurityChime(isAttack: boolean) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isAttack ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(isAttack ? 587.33 : 440, ctx.currentTime);
    if (isAttack) {
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    } else {
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15);
    }

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // Audio context may be restricted before user interaction
  }
}

export const SentryGridProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [machines, setMachines] = useState<MachineSnapshot[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>('pump-02');
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [history, setHistory] = useState<Record<string, HistoryReading[]>>({});
  const [scenarios, setScenarios] = useState<ScenarioOption[]>([]);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);

  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tickCount, setTickCount] = useState<number>(0);
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const wsClientRef = useRef<SentryWebSocketClient | null>(null);
  const audioEnabledRef = useRef(audioAlertsEnabled);
  audioEnabledRef.current = audioAlertsEnabled;

  const addToast = useCallback((toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { ...toast, id, timestamp: Date.now() };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch machine history
  const fetchHistoryForMachine = useCallback(async (machineId: string, n = 120) => {
    try {
      const data = await api.getHistory(machineId, n);
      setHistory((prev) => ({ ...prev, [machineId]: data }));
    } catch (e) {
      console.warn(`[History] Failed to fetch for ${machineId}`, e);
    }
  }, []);

  // Full data refresh
  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const isAlive = await api.checkHealth();
      setBackendConnected(isAlive);

      if (isAlive) {
        const [machinesData, alertsData, scenariosData, metricsData] = await Promise.all([
          api.getMachines().catch(() => []),
          api.getAlerts(50).catch(() => []),
          api.getScenarios().catch(() => []),
          api.getMetrics().catch(() => null),
        ]);

        if (machinesData.length > 0) {
          setMachines(machinesData);
        }
        setAlerts(alertsData);
        if (scenariosData.length > 0) {
          setScenarios(scenariosData);
        }
        if (metricsData) {
          setMetrics(metricsData);
        }

        // Fetch history for the active machine
        if (selectedMachineId) {
          fetchHistoryForMachine(selectedMachineId, 120);
        }

        setLastUpdated(new Date());
        setTickCount((c) => c + 1);
      }
    } catch (err) {
      console.error('[Refresh] Error refreshing data', err);
      setBackendConnected(false);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedMachineId, fetchHistoryForMachine]);

  // Handle WebSocket events
  const handleWsEvent = useCallback(
    (ev: WsEvent) => {
      setTickCount((c) => c + 1);
      setLastUpdated(new Date());
      setBackendConnected(true);

      if (ev.type === 'status') {
        setMachines((prev) => {
          const idx = prev.findIndex((m) => m.machine_id === ev.machine_id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...ev } as MachineSnapshot;
            return updated;
          }
          return [...prev, ev as unknown as MachineSnapshot];
        });

        // If this status is for the currently selected machine, append to history
        if (ev.machine_id && ev.reading) {
          setHistory((prev) => {
            const currentList = prev[ev.machine_id!] || [];
            const newReading: HistoryReading = {
              id: Date.now(),
              machine_id: ev.machine_id!,
              tick: ev.reading.tick,
              ts: Date.now() / 1000,
              temp: ev.reading.temp,
              vib_rms: ev.reading.vib_rms,
              current: ev.reading.current,
              interval_ms: ev.reading.interval_ms,
              pkt_rate: ev.reading.pkt_rate,
              state: ev.state,
              kind: ev.kind,
              confidence: ev.confidence,
              truth: ev.reading.label || ev.kind,
            };
            return {
              ...prev,
              [ev.machine_id!]: [...currentList.slice(-119), newReading],
            };
          });
        }
      } else if (ev.type === 'alert') {
        const isAttack = ev.state === 'ATTACK';
        if (audioEnabledRef.current) {
          playSecurityChime(isAttack);
        }
        addToast({
          type: isAttack ? 'alert' : 'warning',
          title: `${isAttack ? '🚨 CYBERATTACK DETECTED' : '⚠️ EQUIPMENT FAULT DETECTED'} [${ev.machine_id}]`,
          message: ev.text || `High-confidence detection: ${ev.kind}`,
        });

        const newAlert: SecurityAlert = {
          id: ev.alert_id || Date.now(),
          machine_id: ev.machine_id || 'unknown',
          ts: ev.ts || Date.now() / 1000,
          state: ev.state || 'FAULT',
          kind: ev.kind || 'unknown',
          confidence: ev.confidence || 0.9,
          text: ev.text || '',
          evidence: ev.evidence || [],
          latency_s: ev.latency_s || null,
          resolved_ts: null,
        };

        setAlerts((prev) => [newAlert, ...prev.filter((a) => a.id !== newAlert.id)]);
      } else if (ev.type === 'resolved') {
        addToast({
          type: 'success',
          title: `✅ ALERT RESOLVED [${ev.machine_id}]`,
          message: `Asset returned to stable operational parameters. Alert #${ev.alert_id} closed.`,
        });

        setAlerts((prev) =>
          prev.map((a) =>
            a.id === ev.alert_id ? { ...a, resolved_ts: Date.now() / 1000 } : a
          )
        );
      }
    },
    [addToast]
  );

  // Setup WebSocket and polling
  useEffect(() => {
    const client = new SentryWebSocketClient();
    wsClientRef.current = client;

    client.connect(handleWsEvent, (connected) => {
      setWsConnected(connected);
      if (connected) {
        setBackendConnected(true);
      }
    });

    refreshAll();

    const interval = setInterval(() => {
      refreshAll();
    }, 2500);

    return () => {
      clearInterval(interval);
      client.destroy();
    };
  }, [handleWsEvent, refreshAll]);

  useEffect(() => {
    if (selectedMachineId) {
      fetchHistoryForMachine(selectedMachineId, 120);
    }
  }, [selectedMachineId, fetchHistoryForMachine]);

  const injectScenario = async (machineId: string, kind: string, magnitude = 1.0): Promise<boolean> => {
    try {
      const res = await api.injectScenario(machineId, kind, magnitude);
      addToast({
        type: 'info',
        title: `⚡ SCENARIO INJECTED: ${kind}`,
        message: `Injected into ${res.machine_id} with magnitude ${magnitude.toFixed(1)}x. Model observing physical & wire response.`,
      });
      setTimeout(() => refreshAll(), 600);
      return true;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'INJECTION FAILED',
        message: err.message || 'Could not communicate with backend simulator.',
      });
      return false;
    }
  };

  const clearScenario = async (machineId: string): Promise<boolean> => {
    try {
      const res = await api.clearScenario(machineId);
      addToast({
        type: 'success',
        title: '↺ SCENARIO CLEARED',
        message: `Cleared active test anomaly on ${res.cleared}. Machine recovering to baseline.`,
      });
      setTimeout(() => refreshAll(), 600);
      return true;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'CLEAR FAILED',
        message: err.message || 'Could not clear scenario.',
      });
      return false;
    }
  };

  const activeMachine = machines.find((m) => m.machine_id === selectedMachineId);

  return (
    <SentryGridContext.Provider
      value={{
        machines,
        selectedMachineId,
        setSelectedMachineId,
        activeMachine,
        alerts,
        history,
        scenarios,
        metrics,
        backendConnected,
        wsConnected,
        isRefreshing,
        lastUpdated,
        tickCount,
        audioAlertsEnabled,
        setAudioAlertsEnabled,
        toasts,
        addToast,
        removeToast,
        injectScenario,
        clearScenario,
        refreshAll,
        fetchHistoryForMachine,
      }}
    >
      {children}
    </SentryGridContext.Provider>
  );
};

export const useSentryGrid = () => {
  const context = useContext(SentryGridContext);
  if (!context) {
    throw new Error('useSentryGrid must be used within a SentryGridProvider');
  }
  return context;
};
