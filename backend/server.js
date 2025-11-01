import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import connectDB from './config/db.js';
import { apiLimiter, authLimiter, jobApplicationLimiter, userInfoLimiter } from './middleware/rateLimit.js';
import { sanitizeInput, sanitizeJobInput } from './middleware/sanitizeMiddleware.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// Import socket service
import socketService from './utils/socket.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// 🔥 CRITICAL FIX: Add trust proxy for rate limiting
app.set('trust proxy', 1);

// ===== INITIALIZATION =====
socketService.initialize(server);
connectDB();

// ===== MIDDLEWARE SETUP =====
app.use(cors({
  origin: [
    'https://jobconnect-platform-zeta.vercel.app',
    'https://jobconnect-platform.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);

// Serve static files only in development (use cloud storage in production)
if (process.env.NODE_ENV === 'development') {
  app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// ===== RATE LIMITING =====
// Enable rate limiting in production
if (process.env.NODE_ENV === 'production') {
  app.use('/api/auth', authLimiter);
  app.use('/api/applications/apply', jobApplicationLimiter);
  app.use('/api/users/me', userInfoLimiter);
  app.use('/api/', apiLimiter);
}

// ===== REQUEST LOGGING =====
// Only log in development for better performance
if (process.env.NODE_ENV === 'development') {
  app.use('/api/users/profile', (req, res, next) => {
    console.log('User Profile Request:', {
      method: req.method,
      body: req.body,
      user: req.user?.id,
      headers: req.headers
    });
    next();
  });

  app.use('/api/employer/company-profile', (req, res, next) => {
    console.log('Company Profile Request:', {
      method: req.method,
      body: req.body,
      user: req.user?.id
    });
    next();
  });
}

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/jobs', sanitizeJobInput, jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// ===== ENHANCED ROUTES =====
try {
  const savedJobsRoutes = await import('./routes/savedJobsRoutes.js');
  const jobAlertsRoutes = await import('./routes/jobAlertsRoutes.js');
  const analyticsRoutes = await import('./routes/analyticsRoutes.js');
  const employerRoutes = await import('./routes/employerRoutes.js');
  
  app.use('/api/saved-jobs', savedJobsRoutes.default);
  app.use('/api/job-alerts', jobAlertsRoutes.default);
  app.use('/api/analytics', analyticsRoutes.default);
  app.use('/api/employer', employerRoutes.default);
  
  console.log('Enhanced routes loaded successfully');
} catch (error) {
  console.log('Some enhanced routes not available yet:', error.message);
}

// ===== HEALTH CHECKS =====
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'JobConnect SA API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

app.get('/api/socket-health', (req, res) => {
  res.json({
    success: true,
    message: 'Socket.io is running',
    connectedUsers: Array.from(socketService.users.keys()).length
  });
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ===== SERVER STARTUP =====
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Rate limiting: ${process.env.NODE_ENV === 'production' ? 'ENABLED' : 'DISABLED'}`);
  console.log(`WebSocket server: INITIALIZED`);
});