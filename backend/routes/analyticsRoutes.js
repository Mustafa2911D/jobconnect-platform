import express from 'express';
import {
  getCandidateAnalytics,
  getEmployerAnalytics
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Candidate analytics route
router.get('/candidate', authorize('candidate'), getCandidateAnalytics);

// Employer analytics route  
router.get('/employer', authorize('employer'), getEmployerAnalytics);

export default router;