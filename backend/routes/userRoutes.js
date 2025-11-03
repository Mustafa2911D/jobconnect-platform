import express from 'express';
import {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  uploadAvatar,
  uploadProfileImage, 
  getProfileStrength,
  deleteAccount,
  getSavedProfiles,
  saveProfile,
  removeSavedProfile,
  updateSavedProfileNotes,
  checkIfProfileSaved,
  getEmployerPublicProfile
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload, { uploadProfileImage as uploadProfileImageMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public employer profile route 
router.get('/employer/:employerId/public-profile', getEmployerPublicProfile);

router.use(protect);

// Basic user routes
router.get('/profile', getProfile);
router.get('/profile-strength', getProfileStrength);
router.put('/profile', updateProfile);

// Settings routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

router.post('/avatar', uploadProfileImageMiddleware.single('profileImage'), uploadProfileImage);
router.post('/upload-profile-image', uploadProfileImageMiddleware.single('profileImage'), uploadProfileImage);

router.delete('/account', deleteAccount);

// Saved Profiles routes 
router.get('/saved-profiles', authorize('employer'), getSavedProfiles);
router.post('/saved-profiles', authorize('employer'), saveProfile);
router.delete('/saved-profiles/:candidateId', authorize('employer'), removeSavedProfile);
router.put('/saved-profiles/:candidateId/notes', authorize('employer'), updateSavedProfileNotes);
router.get('/saved-profiles/check/:candidateId', authorize('employer'), checkIfProfileSaved);

export default router;