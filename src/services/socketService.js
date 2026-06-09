// Socket service using Socket.IO client with fallback simulation
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.listeners = {};
    this.connected = false;
    this.socket = null;
    this._simulateInterval = null;
  }

  connect(url, token) {
    // Try Socket.IO client first, fallback to simulation for demo
    try {
      this.socket = io(url.replace(/\/$/,''), {
        auth: { token },
        // Let Socket.IO choose transports (polling first, then upgrade)
      });

      this.socket.on('connect', () => {
        this.connected = true;
        this._emit('connect');
      });

      this.socket.on('disconnect', () => {
        this.connected = false;
        this._emit('disconnect');
        this._startSimulation();
      });

      // Forward common server events to local listeners
      this.socket.on('new-notification', (data) => this._emit('new-notification', data));
      this.socket.on('lowStockAlert', (data) => this._emit('lowStockAlert', data));
      this.socket.on('dashboard-update', (data) => this._emit('dashboard-update', data));

      this.socket.on('connect_error', (err) => {
        console.warn('Socket connect error:', err?.message || err);
        this._startSimulation();
      });
    } catch (err) {
      console.warn('Socket.IO client init failed, falling back to simulation:', err?.message || err);
      this._startSimulation();
    }
  }

  _startSimulation() {
    // Simulate real-time updates for demo
    this.connected = true;
    this._emit('connect');
    this._simulateInterval = setInterval(() => {
      this._emit('dashboard-update', {
        kpi: {
          revenue: { total: `$${(Math.random() * 10000 + 45000).toFixed(0)}`, growth_percentage: +(Math.random() * 20 - 5).toFixed(1), trend: Math.random() > 0.3 ? 'up' : 'down' },
          sales: { count: Math.floor(Math.random() * 100 + 500), growth_percentage: +(Math.random() * 15).toFixed(1), avg_transaction_value: `$${(Math.random() * 50 + 80).toFixed(2)}`, unique_customers: Math.floor(Math.random() * 50 + 300) },
        },
        liveTransaction: { amount: `$${(Math.random() * 500 + 20).toFixed(2)}`, branch: ['Colombo', 'Kandy', 'Galle', 'Negombo'][Math.floor(Math.random() * 4)], time: new Date().toLocaleTimeString() }
      });
    }, 5000);
  }

  // Join/leave notifications room on server
  joinNotifications(userId) {
    if (this.socket && this.socket.emit) this.socket.emit('joinNotifications', userId);
  }

  leaveNotifications(userId) {
    if (this.socket && this.socket.emit) this.socket.emit('leaveNotifications', userId);
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  _emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }

  disconnect() {
    if (this.socket) this.socket.close();
    if (this._simulateInterval) clearInterval(this._simulateInterval);
    this.connected = false;
  }
}

export const socketService = new SocketService();
export default socketService;
