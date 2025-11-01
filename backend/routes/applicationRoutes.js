import express from 'express';
import {
  applyForJob,
  getJobApplications,
  getCandidateApplications,
  updateApplicationStatus,
  getCandidateProfile
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { body } from 'express-validator';

const router = express.Router();

router.post(
  '/apply',
  protect,
  authorize('candidate'),
  upload.single('resume'),
  [
    body('jobId').notEmpty().withMessage('Job ID is required'),
    body('coverLetter').optional().trim()
  ],
  applyForJob
);

router.get(
  '/candidate/my-applications',
  protect,
  authorize('candidate'),
  getCandidateApplications
);

router.get(
  '/job/:jobId',
  protect,
  authorize('employer'),
  getJobApplications
);

router.put(
  '/:id/status',
  protect,
  authorize('employer'),
  [
    body('status').isIn(['pending', 'reviewed', 'accepted', 'rejected']).withMessage('Invalid status')
  ],
  updateApplicationStatus
);

router.get(
  '/candidate/:candidateId/profile',
  protect,
  authorize('employer'),
  getCandidateProfile
);

export default router;