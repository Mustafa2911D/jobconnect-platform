import express from 'express';
import {
  getPlatformAnalytics,
  manageUsers,
  manageJobs
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); 

router.get('/analytics', getPlatformAnalytics);
router.post('/users/manage', manageUsers);
router.post('/jobs/manage', manageJobs);

export default router;