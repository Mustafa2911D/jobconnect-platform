import express from 'express';
import {
  getSavedJobs,
  saveJob,
  removeSavedJob,
  updateSavedJobNotes,
  checkIfSaved
} from '../controllers/savedJobsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.use(authorize('candidate'));

router.get('/', getSavedJobs);
router.post('/', saveJob);
router.delete('/:jobId', removeSavedJob);
router.put('/:jobId/notes', updateSavedJobNotes);
router.get('/check/:jobId', checkIfSaved);

export default router;