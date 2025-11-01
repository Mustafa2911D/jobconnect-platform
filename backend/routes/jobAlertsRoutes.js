import express from 'express';
import {
  getJobAlerts,
  createJobAlert,
  updateJobAlert,
  deleteJobAlert,
  triggerJobAlert
} from '../controllers/jobAlertsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('candidate'));

router.get('/', getJobAlerts);
router.post('/', createJobAlert);
router.put('/:alertId', updateJobAlert);
router.delete('/:alertId', deleteJobAlert);
router.post('/:alertId/trigger', triggerJobAlert);

export default router;