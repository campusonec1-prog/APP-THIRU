// WebSocket Real-time Service for APP-THIRU
// Connects to ws://127.0.0.1:8000/ws/realtime/ and triggers live updates without page refresh.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const WS_URL = API_BASE_URL.replace(/^http/, 'ws').replace(/\/api\/?$/, '') + '/ws/realtime/';

class RealtimeWebSocketManager {
  constructor() {
    this.socket = null;
    this.subscribers = new Set();
    this.reconnectTimeout = null;
    this.isConnecting = false;
  }

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.isConnecting = true;
      this.socket = new WebSocket(WS_URL);

      this.socket.onopen = () => {
        console.log('[WebSocket] Connected to real-time updates:', WS_URL);
        this.isConnecting = false;
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          console.log('[WebSocket] Real-time payload received:', payload);
          this.notifySubscribers(payload);
        } catch (e) {
          console.error('[WebSocket] Failed to parse payload:', event.data, e);
          this.notifySubscribers({ type: 'UPDATE', raw: event.data });
        }
      };

      this.socket.onerror = (error) => {
        console.warn('[WebSocket] Error encountered:', error);
      };

      this.socket.onclose = () => {
        console.log('[WebSocket] Connection closed. Attempting reconnect in 3s...');
        this.isConnecting = false;
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
      };
    } catch (err) {
      console.error('[WebSocket] Setup exception:', err);
      this.isConnecting = false;
      this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.connect();
    }
    return () => {
      this.subscribers.delete(callback);
    };
  }

  notifySubscribers(payload) {
    this.subscribers.forEach((callback) => {
      try {
        callback(payload);
      } catch (err) {
        console.error('[WebSocket] Subscriber callback error:', err);
      }
    });
  }
}

export const realtimeManager = new RealtimeWebSocketManager();
export default realtimeManager;
