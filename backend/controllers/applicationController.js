import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { 
  sendApplicationConfirmation, 
  sendNewApplicationNotification,
  sendApplicationStatusNotification 
} from '../utils/emailService.js';
import { validationResult } from 'express-validator';
import socketService from '../utils/socket.js';

// ===== APPLICATION SUBMISSION =====
export const applyForJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { jobId, coverLetter } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const existingApplication = await Application.findOne({
      candidate: req.user.id,
      job: jobId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // 🔥 FIX: Store only the filename, not the full path
    let resumePath = req.file.filename; // Just store the filename
    
    // If it's a full path, extract just the filename
    if (resumePath.includes('/')) {
      resumePath = resumePath.split('/').pop();
    }

    console.log('📄 Resume file saved:', resumePath);

    const application = await Application.create({
      candidate: req.user.id,
      job: jobId,
      resume: resumePath, // Store only filename
      coverLetter
    });

    await job.incrementApplication();

    const candidate = await User.findById(req.user.id);
    candidate.stats.jobApplications = (candidate.stats.jobApplications || 0) + 1;
    await candidate.updateCareerStats();
    await candidate.save();

    const employer = await User.findById(job.employer);

    try {
      await sendApplicationConfirmation(candidate.email, job.title, job.company);
      await sendNewApplicationNotification(employer.email, candidate.name, job.title);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        ...application.toObject(),
        // 🔥 FIX: Return the accessible URL for the resume
        resumeUrl: `/api/uploads/${resumePath}`
      }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting application'
    });
  }
};

// ===== APPLICATION RETRIEVAL =====
export const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job'
      });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email phone location resume profile skills experience education')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
};

export const getCandidateApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate('job')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Get candidate applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
};

// ===== APPLICATION MANAGEMENT =====
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate', 'email name _id');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const job = await Job.findById(application.job._id);
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    const previousStatus = application.status;
    application.status = status;
    application.updatedAt = new Date();
    await application.save();

    if (status === 'accepted') {
      const candidate = await User.findById(application.candidate._id);
      candidate.stats.careerStats = candidate.stats.careerStats || {};
      candidate.stats.careerStats.offers = (candidate.stats.careerStats.offers || 0) + 1;
      await candidate.updateCareerStats();
      await candidate.save();
    }

    // Send email notification to candidate
    const employerUser = await User.findById(req.user.id);
    try {
      await sendApplicationStatusNotification(
        application.candidate.email,
        application.candidate.name,
        job.title,
        job.company,
        status,
        employerUser.name
      );
    } catch (emailError) {
      console.error('Failed to send status notification email:', emailError);
    }

    await sendApplicationStatusNotificationToSocket(application, status, req.user);

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating application status'
    });
  }
};

// ===== CANDIDATE PROFILES =====
export const getCandidateProfile = async (req, res) => {
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
    const hasApplication = await Application.findOne({
      candidate: candidateId,
      job: { $in: employerJobs }
    });

    if (!hasApplication) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this candidate profile'
      });
    }

    res.json({
      success: true,
      candidate
    });
  } catch (error) {
    console.error('Get candidate profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching candidate profile'
    });
  }
};

// ===== NOTIFICATION HELPERS =====
const sendApplicationStatusNotificationToSocket = async (application, status, employer) => {
  try {
    const employerUser = await User.findById(employer.id);
    const candidate = await User.findById(application.candidate._id);
    const job = await Job.findById(application.job);

    if (!candidate || !employerUser || !job) {
      console.error('Missing user or job data for notification');
      return;
    }

    let messageContent = '';
    let notificationType = '';

    switch (status) {
      case 'accepted':
        messageContent = `Congratulations! Your application for "${job.title}" at ${job.company} has been accepted. The employer will contact you soon for next steps.`;
        notificationType = 'application_accepted';
        break;
      case 'rejected':
        messageContent = `Thank you for your application for "${job.title}" at ${job.company}. Unfortunately, your application was not successful at this time.`;
        notificationType = 'application_rejected';
        break;
      case 'reviewed':
        messageContent = `Your application for "${job.title}" at ${job.company} has been reviewed. The employer is currently considering your application.`;
        notificationType = 'application_reviewed';
        break;
      default:
        return;
    }

    let conversation = await Conversation.findOne({
      $and: [
        { 'participants.user': employer.id },
        { 'participants.user': candidate._id },
        { isActive: true }
      ]
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [
          { user: employer.id, role: employerUser.role },
          { user: candidate._id, role: candidate.role }
        ],
        job: job._id,
        metadata: {
          initiatedBy: employer.id,
          initiatedAt: new Date(),
          lastActivity: new Date()
        }
      });
      await conversation.save();
    }

    const message = new Message({
      conversation: conversation._id,
      sender: employer.id,
      content: messageContent,
      messageType: 'system',
      status: 'sent'
    });

    await message.save();

    conversation.lastMessage = message._id;
    conversation.metadata.lastActivity = new Date();
    await conversation.save();

    socketService.sendToUser(candidate._id.toString(), 'application-status-updated', {
      type: 'APPLICATION_STATUS_UPDATED',
      applicationId: application._id,
      jobTitle: job.title,
      company: job.company,
      status: status,
      message: messageContent,
      timestamp: new Date(),
      employerName: employerUser.name
    });

    socketService.sendToUser(employer.id, 'application-status-confirmed', {
      type: 'APPLICATION_STATUS_CONFIRMED',
      applicationId: application._id,
      candidateName: candidate.name,
      status: status,
      timestamp: new Date()
    });

    console.log(`Application ${status} notification sent to candidate ${candidate.name}`);

  } catch (error) {
    console.error('Error sending application status notification:', error);
  }
};