import type {
  HistoryReading,
  MachineSnapshot,
  ModelMetrics,
  ScenarioOption,
  SecurityAlert,
  WsEvent,
} from '../types/sentrygrid';

// In Vite development, /api is proxied to http://127.0.0.1:8001
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8001/ws';

const DEFAULT_TIMEOUT_MS = 3500;

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export const api = {
  /**
   * Health check to confirm FastAPI backend is alive
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Try configured API_URL first, then fallback to relative /api/health
      let res = await fetchWithTimeout(`${API_URL}/api/health`, {}, 2000).catch(() => null);
      if (!res || !res.ok) {
        res = await fetchWithTimeout(`/api/health`, {}, 2000).catch(() => null);
      }
      if (!res || !res.ok) return false;
      const data = await res.json();
      return !!data.ok;
    } catch {
      return false;
    }
  },

  /**
   * Get real-time snapshot of all industrial machines
   */
  async getMachines(): Promise<MachineSnapshot[]> {
    try {
      const res = await fetchWithTimeout(`${API_URL}/api/machines`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch {
      // Try fallback proxy path
      const res = await fetchWithTimeout(`/api/machines`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    }
  },

  /**
   * Get sensor telemetry history for a specific machine
   */
  async getHistory(machineId: string, n = 120): Promise<HistoryReading[]> {
    const path = `/api/machines/${encodeURIComponent(machineId)}/history?n=${n}`;
    try {
      const res = await fetchWithTimeout(`${API_URL}${path}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch {
      const res = await fetchWithTimeout(path);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    }
  },

  /**
   * Get persistent alerts and detection incidents from SQLite
   */
  async getAlerts(limit = 50): Promise<SecurityAlert[]> {
    const path = `/api/alerts?limit=${limit}`;
    try {
      const res = await fetchWithTimeout(`${API_URL}${path}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch {
      const res = await fetchWithTimeout(path);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    }
  },

  /**
   * Get available attack and fault scenarios
   */
  async getScenarios(): Promise<ScenarioOption[]> {
    try {
      const res = await fetchWithTimeout(`${API_URL}/api/scenarios`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch {
      const res = await fetchWithTimeout(`/api/scenarios`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    }
  },

  /**
   * Inject a test cyberattack or physical fault scenario into a simulated asset
   */
  async injectScenario(
    machineId: string,
    kind: string,
    magnitude = 1.0
  ): Promise<{ injected: string; machine_id: string }> {
    const payload = { machine_id: machineId, kind, magnitude };
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };

    try {
      const res = await fetchWithTimeout(`${API_URL}/api/inject`, options);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Injection failed with status ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      // Fallback
      const res = await fetchWithTimeout(`/api/inject`, options);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Injection failed with status ${res.status}`);
      }
      return await res.json();
    }
  },

  /**
   * Clear active scenario from a machine to restore normal operation
   */
  async clearScenario(machineId: string): Promise<{ cleared: string }> {
    const path = `/api/clear/${encodeURIComponent(machineId)}`;
    const options: RequestInit = { method: 'POST' };

    try {
      const res = await fetchWithTimeout(`${API_URL}${path}`, options);
      if (!res.ok) throw new Error(`Clear failed with status ${res.status}`);
      return await res.json();
    } catch {
      const res = await fetchWithTimeout(path, options);
      if (!res.ok) throw new Error(`Clear failed with status ${res.status}`);
      return await res.json();
    }
  },

  /**
   * Get saved model metrics and confusion matrix
   */
  async getMetrics(): Promise<ModelMetrics> {
    try {
      const res = await fetchWithTimeout(`${API_URL}/api/metrics`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch {
      const res = await fetchWithTimeout(`/api/metrics`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    }
  },
};

/**
 * WebSocket manager with automatic reconnection, heartbeat, and subscription support
 */
export class SentryWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private onEventCallback: ((event: WsEvent) => void) | null = null;
  private onConnectionChangeCallback: ((connected: boolean) => void) | null = null;
  private reconnectTimer: any = null;
  private isDestroyed = false;

  constructor(url = WS_URL) {
    this.url = url;
  }

  connect(
    onEvent: (event: WsEvent) => void,
    onConnectionChange: (connected: boolean) => void
  ) {
    this.onEventCallback = onEvent;
    this.onConnectionChangeCallback = onConnectionChange;
    this.isDestroyed = false;
    this._initWs();
  }

  private _initWs() {
    if (this.isDestroyed) return;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        if (this.onConnectionChangeCallback) {
          this.onConnectionChangeCallback(true);
        }
      };

      this.ws.onmessage = (messageEvent) => {
        try {
          const parsed = JSON.parse(messageEvent.data);
          if (this.onEventCallback) {
            this.onEventCallback(parsed);
          }
        } catch (e) {
          console.warn('[WS] Failed to parse message', e);
        }
      };

      this.ws.onclose = () => {
        if (this.onConnectionChangeCallback) {
          this.onConnectionChangeCallback(false);
        }
        this._scheduleReconnect();
      };

      this.ws.onerror = () => {
        if (this.ws) {
          this.ws.close();
        }
      };
    } catch {
      this._scheduleReconnect();
    }
  }

  private _scheduleReconnect() {
    if (this.isDestroyed || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this._initWs();
    }, 2500);
  }

  destroy() {
    this.isDestroyed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
