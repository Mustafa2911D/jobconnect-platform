import User from '../models/User.js';
import Job from '../models/Job.js';

// ===== SAVED JOB STATUS & RETRIEVAL =====
export const checkIfSaved = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isSaved = user.savedJobs.some(saved => saved.job.toString() === jobId);

    res.json({
      success: true,
      isSaved
    });
  } catch (error) {
    console.error('Check saved job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking saved status'
    });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedJobs.job',
      populate: {
        path: 'employer',
        select: 'name company profile.avatar'
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const savedJobs = user.savedJobs.map(saved => ({
      ...saved.job.toObject(),
      savedAt: saved.savedAt,
      notes: saved.notes
    }));

    res.json({
      success: true,
      savedJobs,
      total: savedJobs.length
    });
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved jobs'
    });
  }
};

// ===== SAVED JOB MANAGEMENT =====
export const saveJob = async (req, res) => {
  try {
    const { jobId, notes = '' } = req.body;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const alreadySaved = user.savedJobs.some(saved => saved.job.toString() === jobId);
    if (alreadySaved) {
      return res.status(400).json({
        success: false,
        message: 'Job already saved'
      });
    }

    await user.addSavedJob(jobId, notes);
    await Job.findByIdAndUpdate(jobId, { $inc: { 'stats.saves': 1 } });

    res.json({
      success: true,
      message: 'Job saved successfully',
      savedJob: {
        job: job._id,
        savedAt: new Date(),
        notes
      }
    });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving job'
    });
  }
};

export const removeSavedJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.removeSavedJob(jobId);

    res.json({
      success: true,
      message: 'Job removed from saved jobs'
    });
  } catch (error) {
    console.error('Remove saved job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing saved job'
    });
  }
};

// ===== SAVED JOB NOTES MANAGEMENT =====
export const updateSavedJobNotes = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { notes } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const savedJob = user.savedJobs.find(saved => saved.job.toString() === jobId);
    
    if (!savedJob) {
      return res.status(404).json({
        success: false,
        message: 'Saved job not found'
      });
    }

    savedJob.notes = notes;
    await user.save();

    res.json({
      success: true,
      message: 'Notes updated successfully',
      savedJob: {
        job: savedJob.job,
        savedAt: savedJob.savedAt,
        notes: savedJob.notes
      }
    });
  } catch (error) {
    console.error('Update saved job notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notes'
    });
  }
};