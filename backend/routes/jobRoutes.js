import express from 'express';
import {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getJobStats,
  bulkUpdateJobs,
  getJobTrends
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';

const router = express.Router();

const validateJob = [
  body('title').notEmpty().withMessage('Job title is required'),
  body('company').notEmpty().withMessage('Company name is required'),
  body('location.province').notEmpty().withMessage('Province is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('type').isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Freelance']).withMessage('Invalid job type'),
  body('category').isIn(['Information Technology', 'Finance', 'Healthcare', 'Engineering', 'Education', 'Sales & Marketing', 'Hospitality', 'Construction', 'Manufacturing', 'Government', 'Design', 'Other']).withMessage('Invalid category'),
  body('description').notEmpty().withMessage('Description is required'),
  body('requirements').notEmpty().withMessage('Requirements are required'),
  body('salary.min').optional().isNumeric().withMessage('Minimum salary must be a number'),
  body('salary.max').optional().isNumeric().withMessage('Maximum salary must be a number')
];

// Public routes
router.get('/', getJobs);
router.get('/:id', getJob);

// Protected routes 
router.use(protect);

// Employer routes
router.post('/', authorize('employer'), validateJob, createJob);
router.put('/:id', authorize('employer'), validateJob, updateJob);
router.delete('/:id', authorize('employer'), deleteJob);
router.get('/employer/my-jobs', authorize('employer'), getEmployerJobs);
router.get('/:id/stats', authorize('employer'), getJobStats);
router.patch('/bulk-update', authorize('employer'), bulkUpdateJobs);
router.get('/trends/job-trends', getJobTrends);

export default router;