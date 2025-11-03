import rateLimit from 'express-rate-limit';

// Common rate limit configuration with proxy support
const commonConfig = {
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, 
};

// ===== AUTHENTICATION RATE LIMITING =====
export const authLimiter = rateLimit({
  ...commonConfig,
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  skipSuccessfulRequests: true,
});

// ===== GENERAL API RATE LIMITING =====
export const apiLimiter = rateLimit({
  ...commonConfig,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP'
  },
});

export const userInfoLimiter = rateLimit({
  ...commonConfig,
  max: 50,
  message: {
    success: false,
    message: 'Too many user info requests'
  },
});

// ===== JOB APPLICATION RATE LIMITING =====
export const jobApplicationLimiter = rateLimit({
  ...commonConfig,
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many job applications, please try again later'
  },
});