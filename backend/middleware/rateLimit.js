import rateLimit from 'express-rate-limit';

// ===== AUTHENTICATION RATE LIMITING =====
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// ===== GENERAL API RATE LIMITING =====
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const userInfoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many user info requests'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ===== JOB APPLICATION RATE LIMITING =====
export const jobApplicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many job applications, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});