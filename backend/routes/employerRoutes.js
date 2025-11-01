import express from 'express';
import {
  getEmployerProfile,
  updateEmployerProfile,
  getEmployerStats,
  getEmployerApplications,
  getAllEmployerApplications,
  updateCompanyProfile,
  uploadEmployerProfileImage, 
  getEmployerCurrentJobs,
  getPotentialCandidates,
  getCandidateDetails,
  deleteAccount
} from '../controllers/employerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadProfileImage } from '../middleware/uploadMiddleware.js'; 

const router = express.Router();

router.use(protect);
router.use(authorize('employer'));

router.get('/profile', getEmployerProfile);
router.put('/profile', updateEmployerProfile);
router.put('/company-profile', updateCompanyProfile);
router.get('/stats', getEmployerStats);
router.get('/applications', getEmployerApplications);
router.get('/all-applications', getAllEmployerApplications);

router.post('/upload-profile-image', uploadProfileImage.single('profileImage'), uploadEmployerProfileImage);

router.delete('/account', deleteAccount);

router.get('/current-jobs', getEmployerCurrentJobs);
router.get('/potential-candidates', getPotentialCandidates);
router.get('/candidates/:candidateId', getCandidateDetails);

export default router;