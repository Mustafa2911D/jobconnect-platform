import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
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
export const getEmployerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      profile: {
        ...user.toObject(),
        companyProfile: user.companyProfile || {}
      }
    });
  } catch (error) {
    console.error('Get employer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employer profile'
    });
  }
};

export const updateEmployerProfile = async (req, res) => {
  try {
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
      companyProfile,
      contact
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (profile) updateData.profile = { ...req.user.profile, ...profile };
    if (companyProfile) updateData.companyProfile = { ...req.user.companyProfile, ...companyProfile };
    if (contact) updateData.contact = { ...req.user.contact, ...contact };

    updateData['stats.lastActive'] = new Date();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Employer profile updated successfully',
      profile: user
    });
  } catch (error) {
    console.error('Update employer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employer profile'
    });
  }
};

export const updateCompanyProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { companyProfile } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        companyProfile: { ...req.user.companyProfile, ...companyProfile },
        'stats.lastActive': new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Company profile updated successfully',
      profile: user
    });
  } catch (error) {
    console.error('Update company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating company profile'
    });
  }
};

export const uploadEmployerProfileImage = async (req, res) => {
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
    
    if (user.role === 'employer' && user.companyProfile) {
      user.companyProfile.logo = req.file.filename;
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
    console.error('Employer profile image upload error:', error);
    
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

// ===== STATISTICS & ANALYTICS =====
export const getEmployerStats = async (req, res) => {
  try {
    const employerId = req.user.id;
    
    const user = await User.findById(employerId);
    await user.updateEmployerStats();
    
    const employerJobs = await Job.find({ employer: employerId });
    const jobIds = employerJobs.map(job => job._id);

    const [
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      acceptedApplications
    ] = await Promise.all([
      Job.countDocuments({ employer: employerId }),
      Job.countDocuments({ employer: employerId, status: 'active' }),
      Application.countDocuments({ job: { $in: jobIds } }),
      Application.countDocuments({ 
        job: { $in: jobIds }, 
        status: 'pending' 
      }),
      Application.countDocuments({ 
        job: { $in: jobIds }, 
        status: 'accepted' 
      })
    ]);

    const respondedApplications = await Application.countDocuments({
      job: { $in: jobIds },
      status: { $in: ['reviewed', 'accepted', 'rejected'] }
    });

    const responseRate = totalApplications > 0 
      ? Math.round((respondedApplications / totalApplications) * 100)
      : 0;

    const applications = await Application.find({
      job: { $in: jobIds },
      status: { $in: ['reviewed', 'accepted', 'rejected'] }
    }).select('createdAt updatedAt');

    let totalResponseTime = 0;
    let respondedCount = 0;
    
    applications.forEach(app => {
      const responseTime = (app.updatedAt - app.createdAt) / (1000 * 60 * 60 * 24);
      if (responseTime > 0) {
        totalResponseTime += responseTime;
        respondedCount++;
      }
    });

    const avgResponseTime = respondedCount > 0 ? Math.round(totalResponseTime / respondedCount) : 0;

    res.json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications,
        successfulHires: acceptedApplications,
        responseRate,
        avgResponseTime,
        conversionRate: totalApplications > 0 ? ((acceptedApplications / totalApplications) * 100).toFixed(2) : 0,
        ...user.stats.employerStats
      }
    });
  } catch (error) {
    console.error('Get employer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employer stats'
    });
  }
};

// ===== JOB MANAGEMENT =====
export const getEmployerCurrentJobs = async (req, res) => {
  try {
    const employerId = req.user.id;
    
    const jobs = await Job.find({ 
      employer: employerId,
      status: { $in: ['active', 'paused'] }
    })
    .populate('employer', 'name company profile.avatar')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      jobs,
      total: jobs.length
    });
  } catch (error) {
    console.error('Get employer current jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employer jobs'
    });
  }
};

// ===== APPLICATION MANAGEMENT =====
export const getEmployerApplications = async (req, res) => {
  try {
    const employerId = req.user.id;
    
    const applications = await Application.find({
      job: { $in: await Job.find({ employer: employerId }).select('_id') }
    })
    .populate('candidate', 'name email profile skills experience education')
    .populate('job', 'title company')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Get employer applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications'
    });
  }
};

export const getAllEmployerApplications = async (req, res) => {
  try {
    const employerId = req.user.id;
    
    const applications = await Application.find({
      job: { $in: await Job.find({ employer: employerId }).select('_id') }
    })
    .populate('candidate', 'name email profile skills experience education')
    .populate('job', 'title company location type')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications,
      total: applications.length
    });
  } catch (error) {
    console.error('Get all employer applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications'
    });
  }
};

// ===== CANDIDATE MANAGEMENT =====
export const getPotentialCandidates = async (req, res) => {
  try {
    const employerId = req.user.id;
    
    const employerJobs = await Job.find({ employer: employerId });
    const requiredSkills = [...new Set(employerJobs.flatMap(job => job.skills || []))];
    
    let candidateQuery = { role: 'candidate' };
    
    const candidates = await User.find(candidateQuery)
      .select('name email profile skills experience education stats')
      .limit(50);

    const enhancedCandidates = candidates.map(candidate => {
      const matchScore = calculateCandidateMatch(candidate, requiredSkills, employerJobs);
      return {
        ...candidate.toObject(),
        matchScore,
        isGoodMatch: matchScore > 70
      };
    });

    enhancedCandidates.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      candidates: enhancedCandidates,
      total: enhancedCandidates.length
    });
  } catch (error) {
    console.error('Get potential candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching potential candidates'
    });
  }
};

export const getCandidateDetails = async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    const candidate = await User.findById(candidateId)
      .select('-password -email -phone')
      .populate('experience education');

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    const employerJobs = await Job.find({ employer: req.user.id }).select('_id');
    const applications = await Application.find({
      candidate: candidateId,
      job: { $in: employerJobs }
    }).populate('job', 'title');

    res.json({
      success: true,
      candidate: {
        ...candidate.toObject(),
        applications
      }
    });
  } catch (error) {
    console.error('Get candidate details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching candidate details'
    });
  }
};

// ===== ACCOUNT MANAGEMENT =====
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const employerId = req.user.id;

    console.log('Delete employer account request received:', {
      employerId,
      employerName: req.user.name
    });

    const employer = await User.findById(employerId);
    if (!employer) {
      console.log('Employer not found for deletion:', employerId);
      return res.status(404).json({
        success: false,
        message: 'Employer not found'
      });
    }

    console.log('Found employer for deletion:', {
      name: employer.name,
      company: employer.company
    });

    // Correct password verification
    const isPasswordCorrect = await employer.correctPassword(password);
    console.log('Employer password verification result:', isPasswordCorrect);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    console.log(`Starting employer account deletion: ${employer.name} (${employerId})`);

    const employerJobs = await Job.find({ employer: employerId });
    const jobIds = employerJobs.map(job => job._id);
    console.log('Found employer jobs to delete:', employerJobs.length);

    // Delete applications for employer's jobs
    const appDeletionResult = await Application.deleteMany({ job: { $in: jobIds } });
    console.log('Deleted job applications:', appDeletionResult.deletedCount);

    // Delete employer's jobs
    const jobDeletionResult = await Job.deleteMany({ employer: employerId });
    console.log('Deleted employer jobs:', jobDeletionResult.deletedCount);

    // Delete conversations and messages
    const conversations = await Conversation.find({ 
      'participants.user': employerId 
    });
    console.log('Found employer conversations to delete:', conversations.length);
    
    let deletedMessages = 0;
    for (const conversation of conversations) {
      const messageResult = await Message.deleteMany({ conversation: conversation._id });
      deletedMessages += messageResult.deletedCount;
      await Conversation.findByIdAndDelete(conversation._id);
    }
    console.log('Deleted employer conversations and messages:', {
      conversations: conversations.length,
      messages: deletedMessages
    });

    // Delete the employer account
    await User.findByIdAndDelete(employerId);
    console.log('Employer account deleted successfully');

    res.json({
      success: true,
      message: 'Employer account deleted successfully'
    });
  } catch (error) {
    console.error('Delete employer account error details:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting employer account: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ===== HELPER FUNCTIONS =====
const calculateCandidateMatch = (candidate, requiredSkills, employerJobs) => {
  let score = 0;
  
  if (candidate.skills && candidate.skills.length > 0 && requiredSkills.length > 0) {
    const candidateSkillNames = candidate.skills.map(skill => {
      if (typeof skill === 'string') return skill.toLowerCase();
      if (skill && typeof skill === 'object' && skill.name) return skill.name.toLowerCase();
      return '';
    }).filter(skill => skill !== '');
    
    const matchingSkills = candidateSkillNames.filter(candidateSkill =>
      requiredSkills.some(reqSkill => {
        const reqSkillName = typeof reqSkill === 'string' ? reqSkill.toLowerCase() : 
                            (reqSkill && typeof reqSkill === 'object' && reqSkill.name ? reqSkill.name.toLowerCase() : '');
        return candidateSkill.includes(reqSkillName) || reqSkillName.includes(candidateSkill);
      })
    );
    
    score += (matchingSkills.length / Math.max(requiredSkills.length, 1)) * 50;
  }
  
  if (candidate.experience && candidate.experience.length > 0) {
    const totalExperience = candidate.experience.reduce((total, exp) => {
      if (!exp.startDate) return total;
      
      const start = new Date(exp.startDate);
      const end = exp.current ? new Date() : (exp.endDate ? new Date(exp.endDate) : new Date());
      const years = (end - start) / (365 * 24 * 60 * 60 * 1000);
      return total + Math.max(0, years);
    }, 0);
    
    score += Math.min(totalExperience / 10 * 30, 30);
  }
  
  if (candidate.education && candidate.education.length > 0) {
    const hasDegree = candidate.education.some(edu => 
      edu.qualification && ['bachelor', 'master', 'phd', 'degree'].some(degree => 
        edu.qualification.toLowerCase().includes(degree)
      )
    );
    if (hasDegree) score += 20;
  }
  
  return Math.min(Math.round(score), 100);
};