import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 3;
    this.reconnectTimer = null;
  }

  // Connection Management
  connect() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('🔐 No token found for WebSocket connection');
        return;
      }

      // Prevent multiple connection attempts
      if (this.socket?.connected) {
        console.log('🔌 WebSocket already connected');
        return;
      }

      // Disconnect existing connection if any
      if (this.socket) {
        this.disconnect();
      }

      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        console.warn('⚠️ Max connection attempts reached, giving up');
        return;
      }

      this.connectionAttempts++;
      console.log(`🔄 Attempting WebSocket connection (attempt ${this.connectionAttempts})...`);
      
      // 🔥 FIX: Use proper WebSocket URL from environment
      const wsUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '').replace('http', 'ws') || 'wss://jobconnect-backend-yyho.onrender.com';
      
      this.socket = io(wsUrl, {
        auth: { 
          token 
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        autoConnect: true,
        withCredentials: true // 🔥 ADD THIS
      });

      this.setupEventListeners();
      
    } catch (error) {
      console.error('❌ Error creating socket connection:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionAttempts = 0;
      console.log('🔴 WebSocket manually disconnected');
    }
  }

  // Event Listeners Setup
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🟢 WebSocket connected successfully');
      this.isConnected = true;
      this.connectionAttempts = 0; // Reset on successful connection
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔴 WebSocket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
      this.isConnected = false;
    });

    this.socket.on('connected', (data) => {
      console.log('✅ Server connection confirmed:', data.message);
    });

    // Application specific events
    this.socket.on('application-status-updated', (data) => {
      console.log('📨 Received application status update:', data);
      this.showNotification(data);
    });

    this.socket.on('new-message', (data) => {
      console.log('💬 Received new message:', data);
      this.showMessageNotification(data);
    });

    this.socket.on('application-status-confirmed', (data) => {
      console.log('✅ Application status confirmed:', data);
    });
  }

  // Notification Methods
  showNotification(data) {
    if (Notification.permission === 'granted') {
      new Notification('Application Status Update', {
        body: data.message,
        icon: '/favicon.ico'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Application Status Update', {
            body: data.message,
            icon: '/favicon.ico'
          });
        }
      });
    }
  }

  showMessageNotification(data) {
    if (Notification.permission === 'granted') {
      new Notification(`New Message from ${data.senderName}`, {
        body: data.message,
        icon: '/favicon.ico'
      });
    }
  }

  // Socket Event Management
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      try {
        this.socket.emit(event, data);
        console.log(`📤 Emitted ${event}:`, data);
        return true;
      } catch (error) {
        console.error(`❌ Error emitting event ${event}:`, error);
        return false;
      }
    } else {
      console.warn(`⚠️  Cannot emit ${event}: socket not connected`);
      return false;
    }
  }

  // Application Specific Event Handlers
  onApplicationStatusUpdated(callback) {
    this.on('application-status-updated', callback);
  }

  onApplicationStatusConfirmed(callback) {
    this.on('application-status-confirmed', callback);
  }

  onNewMessage(callback) {
    this.on('new-message', callback);
  }

  onConnected(callback) {
    this.on('connected', callback);
  }

  // Application Specific Methods
  notifyApplicationStatusUpdate(candidateId, applicationId, status, message) {
    return this.emit('application-status-update', {
      candidateId,
      applicationId,
      status,
      message
    });
  }

  sendMessage(receiverId, message, conversationId) {
    return this.emit('send-message', { receiverId, message, conversationId });
  }

  // Utility Methods
  getConnectionStatus() {
    return this.isConnected;
  }
}

export default new SocketService();