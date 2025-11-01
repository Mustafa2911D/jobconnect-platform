import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class SocketService {
  constructor() {
    this.io = null;
    this.users = new Map();
  }

  initialize(server) {
    try {
      console.log('🔄 Initializing Socket.io server...');
      
      this.io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow all Vercel domains and localhost
      if (
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost:3000') ||
        origin.includes('jobconnect-platform')
      ) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Authorization"]
  },
        connectionStateRecovery: {
          maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
          skipMiddlewares: true
        }
      });

      this.io.use(this.authenticateSocket.bind(this));
      this.io.on('connection', this.handleConnection.bind(this));

      console.log('✅ Socket.io server initialized successfully');
      return this.io;
    } catch (error) {
      console.error('❌ Failed to initialize Socket.io:', error);
      return null;
    }
  }
  
  // ===== AUTHENTICATION =====
  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.log('🔐 No token provided for socket connection');
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('🔐 User not found for socket connection');
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.userName = user.name;
      
      console.log(`🔐 Socket authenticated for user: ${user.name} (${user.role})`);
      next();
    } catch (error) {
      console.error('🔐 Socket authentication error:', error.message);
      return next(new Error('Authentication error'));
    }
  }

  // ===== CONNECTION MANAGEMENT =====
  handleConnection(socket) {
    console.log(`🟢 User connected: ${socket.userName} (${socket.userId})`);
    
    this.users.set(socket.userId, socket.id);
    socket.join(`user-${socket.userId}`);
    
    if (socket.userRole === 'employer') {
      socket.join(`employer-${socket.userId}`);
    }

    socket.emit('connected', {
      type: 'CONNECTED',
      message: 'WebSocket connection established successfully',
      userId: socket.userId,
      timestamp: new Date()
    });

    socket.on('application-status-update', (data) => {
      console.log('📨 Application status update received:', data);
      this.handleApplicationStatusUpdate(socket, data);
    });

    socket.on('send-message', (data) => {
      console.log('💬 Message received:', data);
      this.handleSendMessage(socket, data);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔴 User disconnected: ${socket.userName} (${socket.userId}) - Reason: ${reason}`);
      this.users.delete(socket.userId);
    });

    socket.on('error', (error) => {
      console.error(`❌ Socket error for user ${socket.userId}:`, error);
    });
  }

  // ===== EVENT HANDLERS =====
  handleApplicationStatusUpdate(socket, data) {
    try {
      const { candidateId, applicationId, status, message } = data;
      
      this.sendToUser(candidateId, 'application-status-updated', {
        type: 'APPLICATION_STATUS_UPDATED',
        applicationId,
        status,
        message,
        timestamp: new Date(),
        employerName: socket.userName
      });

      socket.emit('application-status-confirmed', {
        type: 'APPLICATION_STATUS_CONFIRMED',
        applicationId,
        status,
        timestamp: new Date()
      });

      console.log(`📨 Application status ${status} sent to candidate ${candidateId}`);
    } catch (error) {
      console.error('Error handling application status update:', error);
    }
  }

  handleSendMessage(socket, data) {
    try {
      const { receiverId, message, conversationId } = data;
      
      this.sendToUser(receiverId, 'new-message', {
        type: 'NEW_MESSAGE',
        senderId: socket.userId,
        senderName: socket.userName,
        message,
        conversationId,
        timestamp: new Date()
      });

      socket.emit('message-sent', {
        type: 'MESSAGE_SENT',
        conversationId,
        timestamp: new Date()
      });

      console.log(`💬 Message sent from ${socket.userId} to ${receiverId}`);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  // ===== UTILITY METHODS =====
  sendToUser(userId, event, data) {
    try {
      const socketId = this.users.get(userId);
      if (socketId && this.io) {
        this.io.to(socketId).emit(event, data);
        console.log(`📨 Sent ${event} to user ${userId}`);
        return true;
      } else {
        console.log(`⚠️  User ${userId} not connected, cannot send ${event}`);
        return false;
      }
    } catch (error) {
      console.error(`Error sending ${event} to user ${userId}:`, error);
      return false;
    }
  }

  getConnectedUsersCount() {
    return this.users.size;
  }
}

export default new SocketService();