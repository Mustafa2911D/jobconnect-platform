import User from '../models/User.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== PROFILE MANAGEMENT =====
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

export const getProfileStrength = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let completionScore = 0;
    const fields = [
      { condition: user.name, weight: 10 },
      { condition: user.email, weight: 10 },
      { condition: user.profile?.headline, weight: 15 },
      { condition: user.profile?.bio, weight: 10 },
      { condition: user.profile?.location?.province, weight: 10 },
      { condition: user.profile?.contact?.phone, weight: 10 },
      { condition: user.skills?.length > 0, weight: 15 },
      { condition: user.experience?.length > 0, weight: 10 },
      { condition: user.education?.length > 0, weight: 10 }
    ];

    fields.forEach(field => {
      if (field.condition) {
        completionScore += field.weight;
      }
    });

    const profileCompletion = Math.min(completionScore, 100);
    user.stats.careerStats.profileCompletion = profileCompletion;
    await user.save();

    res.json({
      success: true,
      profileCompletion,
      breakdown: {
        hasName: !!user.name,
        hasEmail: !!user.email,
        hasHeadline: !!user.profile?.headline,
        hasBio: !!user.profile?.bio,
        hasLocation: !!user.profile?.location?.province,
        hasPhone: !!user.profile?.contact?.phone,
        hasSkills: user.skills?.length > 0,
        hasExperience: user.experience?.length > 0,
        hasEducation: user.education?.length > 0
      }
    });
  } catch (error) {
    console.error('Get profile strength error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating profile strength'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    console.log('UPDATE PROFILE REQUEST BODY:', JSON.stringify(req.body, null, 2));
    console.log('USER ID:', req.user.id);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      profile,
      saIdentity,
      skills,
      experience,
      education
    } = req.body;

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updateData = {};
    
    if (name) updateData.name = name;
    
    if (profile) {
      updateData.profile = {
        ...currentUser.profile.toObject(),
        ...profile
      };
      
      if (profile.location) {
        updateData.profile.location = {
          ...(currentUser.profile?.location || {}),
          ...profile.location
        };
      }
      
      if (profile.contact) {
        updateData.profile.contact = {
          ...(currentUser.profile?.contact || {}),
          ...profile.contact
        };
      }
    }
    
    if (saIdentity) {
      updateData.saIdentity = {
        ...(currentUser.saIdentity?.toObject() || {}),
        ...saIdentity
      };
    }
    
    if (skills !== undefined) {
      updateData.skills = skills.map(skill => ({
        name: skill.name,
        level: skill.level || 'intermediate',
        category: skill.category || 'technical'
      }));
    }
    
    if (experience !== undefined) {
      updateData.experience = experience.map(exp => ({
        title: exp.title,
        company: exp.company,
        location: exp.location,
        startDate: exp.startDate ? new Date(exp.startDate) : undefined,
        endDate: exp.current ? null : (exp.endDate ? new Date(exp.endDate) : undefined),
        current: exp.current,
        description: exp.description,
        employmentType: exp.employmentType,
        industry: exp.industry
      })).filter(exp => exp.title && exp.company);
    }
    
    if (education !== undefined) {
      updateData.education = education.map(edu => ({
        institution: edu.institution,
        qualification: edu.qualification,
        field: edu.field,
        startYear: edu.startYear,
        endYear: edu.endYear,
        completed: edu.completed,
        grade: edu.grade,
        description: edu.description,
        qualificationType: edu.qualificationType
      })).filter(edu => edu.institution && edu.qualification);
    }

    updateData['stats.lastActive'] = new Date();

    console.log('FINAL UPDATE DATA:', JSON.stringify(updateData, null, 2));

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    ).select('-password');

    console.log('UPDATED USER SUCCESSFULLY');
    await user.updateCareerStats();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error details:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format for one or more fields'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ===== SETTINGS MANAGEMENT =====
export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('profile.preferences');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return structured settings
    const settings = {
      notifications: user.profile?.preferences?.notifications || {
        jobAlerts: true,
        applicationUpdates: true,
        newMessages: true,
        newsletter: false,
        smsNotifications: false,
        pushNotifications: true,
        emailDigest: false,
        urgentAlerts: true
      },
      privacy: user.profile?.preferences?.privacySettings || {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowMessages: true,
        dataSharing: false,
        searchVisibility: true,
        activityStatus: true,
        twoFactorAuth: false
      },
      appearance: user.profile?.preferences?.appearance || {
        theme: 'light',
        fontSize: 'medium',
        density: 'comfortable',
        reduceAnimations: false,
        highContrast: false,
        colorBlind: false
      },
      regional: user.profile?.preferences?.regional || {
        language: 'en',
        timezone: 'Africa/Johannesburg',
        currency: 'ZAR',
        province: 'Gauteng',
        dateFormat: 'DD/MM/YYYY',
        temperature: 'celsius'
      }
    };

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching settings'
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'Settings data is required'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize preferences 
    if (!user.profile) {
      user.profile = {};
    }
    if (!user.profile.preferences) {
      user.profile.preferences = {};
    }

    // Update settings 
    user.profile.preferences = {
      ...user.profile.preferences,
      notifications: settings.notifications,
      privacySettings: settings.privacy,
      appearance: settings.appearance,
      regional: settings.regional
    };

    user.stats.lastActive = new Date();
    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: user.profile.preferences,
      user: updatedUser
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating settings'
    });
  }
};

// ===== PROFILE IMAGE MANAGEMENT =====
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, '..', 'uploads', 'profile-images', path.basename(user.profileImage));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const imagePath = `uploads/profile-images/${req.file.filename}`;
    user.profileImage = imagePath;
    
    if (user.profile) {
      user.profile.avatar = req.file.filename;
    }
    
    user.stats.lastActive = new Date();
    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      profileImage: user.profileImage,
      user: updatedUser
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', 'profile-images', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while uploading profile image'
    });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, '..', 'uploads', 'profile-images', path.basename(user.profileImage));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const imagePath = `uploads/profile-images/${req.file.filename}`;
    user.profileImage = imagePath;
    
    if (user.profile) {
      user.profile.avatar = req.file.filename;
    }
    
    user.stats.lastActive = new Date();
    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      profileImage: user.profileImage,
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', 'profile-images', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during image upload'
    });
  }
};

// ===== SAVED PROFILES MANAGEMENT =====
export const getSavedProfiles = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedProfiles.candidate',
      select: 'name email profile skills experience education stats',
      populate: [
        { path: 'experience' },
        { path: 'education' }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      savedProfiles: user.savedProfiles,
      total: user.savedProfiles.length
    });
  } catch (error) {
    console.error('Get saved profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved profiles'
    });
  }
};

export const saveProfile = async (req, res) => {
  try {
    const { candidateId, notes = '', tags = [] } = req.body;
    
    const candidate = await User.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    if (candidate.role !== 'candidate') {
      return res.status(400).json({
        success: false,
        message: 'Can only save candidate profiles'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const alreadySaved = user.savedProfiles.some(
      saved => saved.candidate.toString() === candidateId
    );

    if (alreadySaved) {
      return res.status(400).json({
        success: false,
        message: 'Profile already saved'
      });
    }

    await user.saveCandidateProfile(candidateId, notes, tags);

    res.json({
      success: true,
      message: 'Profile saved successfully',
      savedProfile: {
        candidate: candidateId,
        savedAt: new Date(),
        notes,
        tags
      }
    });
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving profile'
    });
  }
};

export const removeSavedProfile = async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.removeSavedProfile(candidateId);

    res.json({
      success: true,
      message: 'Profile removed from saved profiles'
    });
  } catch (error) {
    console.error('Remove saved profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing saved profile'
    });
  }
};

export const updateSavedProfileNotes = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { notes } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const savedProfile = user.savedProfiles.find(
      saved => saved.candidate.toString() === candidateId
    );
    
    if (!savedProfile) {
      return res.status(404).json({
        success: false,
        message: 'Saved profile not found'
      });
    }

    savedProfile.notes = notes;
    await user.save();

    res.json({
      success: true,
      message: 'Notes updated successfully',
      savedProfile: {
        candidate: savedProfile.candidate,
        savedAt: savedProfile.savedAt,
        notes: savedProfile.notes,
        tags: savedProfile.tags
      }
    });
  } catch (error) {
    console.error('Update saved profile notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notes'
    });
  }
};

export const checkIfProfileSaved = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isSaved = user.savedProfiles.some(
      saved => saved.candidate.toString() === candidateId
    );

    res.json({
      success: true,
      isSaved
    });
  } catch (error) {
    console.error('Check saved profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking saved status'
    });
  }
};

// ===== ACCOUNT MANAGEMENT =====
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    console.log('Delete account request received:', {
      userId,
      userRole: req.user.role,
      hasPassword: !!password
    });

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found for deletion:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Found user for deletion:', {
      name: user.name,
      role: user.role,
      email: user.email
    });

    // Check if this is an employer trying to use user route
    if (user.role === 'employer') {
      console.log('Employer attempting to delete via user route - redirecting...');
      return res.status(400).json({
        success: false,
        message: 'Employers should use the employer account deletion endpoint'
      });
    }

    // Password verification 
    const isPasswordCorrect = await user.correctPassword(password);
    console.log('Password verification result:', isPasswordCorrect);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Clean up user data
    console.log(`Starting account deletion for user: ${user.name} (${user._id})`);

    // Delete user's applications
    const deletedApplications = await Application.deleteMany({ candidate: userId });
    console.log('Deleted user applications:', deletedApplications.deletedCount);

    // Remove user from saved jobs
    const jobUpdateResult = await User.updateMany(
      { 'savedJobs.job': { $exists: true } },
      { $pull: { savedJobs: { job: userId } } }
    );
    console.log('Updated users with saved jobs:', jobUpdateResult.modifiedCount);

    // Remove user from job saves
    const Job = mongoose.model('Job');
    const jobSaveUpdate = await Job.updateMany(
      { savedBy: userId },
      { $pull: { savedBy: userId } }
    );
    console.log('Removed user from saved jobs:', jobSaveUpdate.modifiedCount);

    // Delete conversations and messages
    const conversations = await Conversation.find({ 
      'participants.user': userId 
    });
    console.log('Found conversations to delete:', conversations.length);
    
    let deletedMessages = 0;
    for (const conversation of conversations) {
      const messageResult = await Message.deleteMany({ conversation: conversation._id });
      deletedMessages += messageResult.deletedCount;
      await Conversation.findByIdAndDelete(conversation._id);
    }
    console.log('Deleted conversations and messages:', {
      conversations: conversations.length,
      messages: deletedMessages
    });

    // Delete the user
    await User.findByIdAndDelete(userId);
    console.log('User account deleted successfully');

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error details:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getEmployerPublicProfile = async (req, res) => {
  try {
    const { employerId } = req.params;
    
    const employer = await User.findById(employerId)
      .select('name company companyProfile profileImage stats')
      .populate({
        path: 'companyProfile',
        select: 'name industry size description mission culture benefits website logo contact social'
      });

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer not found'
      });
    }

    // Check if employer has active jobs 
    const activeJobsCount = await Job.countDocuments({ 
      employer: employerId, 
      status: 'active' 
    });

    if (activeJobsCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not available'
      });
    }

    // Get employer's active jobs for the profile
    const activeJobs = await Job.find(
      { employer: employerId, status: 'active' },
      'title company location type salary description skills requirements createdAt'
    )
    .sort({ createdAt: -1 })
    .limit(5);

    // Get employer stats
    const employerStats = await getEmployerPublicStats(employerId);

    res.json({
      success: true,
      employer: {
        _id: employer._id,
        name: employer.name,
        company: employer.company,
        profileImage: employer.profileImage,
        companyProfile: employer.companyProfile,
        stats: employerStats,
        activeJobs: activeJobs,
        totalActiveJobs: activeJobsCount
      }
    });
  } catch (error) {
    console.error('Get employer public profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employer profile'
    });
  }
};

// Helper function to get employer public stats
const getEmployerPublicStats = async (employerId) => {
  const totalJobs = await Job.countDocuments({ employer: employerId });
  const activeJobs = await Job.countDocuments({ employer: employerId, status: 'active' });
  const totalApplications = await Application.countDocuments({
    job: { $in: await Job.find({ employer: employerId }).select('_id') }
  });

  return {
    totalJobs,
    activeJobs,
    totalApplications,
    responseRate: totalApplications > 0 ? Math.round((totalApplications / totalJobs) * 100) : 0
  };
};