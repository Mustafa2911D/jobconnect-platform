import User from '../models/User.js';
import Job from '../models/Job.js';

// ===== JOB ALERT CRUD OPERATIONS =====
export const getJobAlerts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      jobAlerts: user.jobAlerts,
      total: user.jobAlerts.length
    });
  } catch (error) {
    console.error('Get job alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job alerts'
    });
  }
};

export const createJobAlert = async (req, res) => {
  try {
    const { name, searchCriteria, frequency = 'daily' } = req.body;
    
    if (!name || !searchCriteria) {
      return res.status(400).json({
        success: false,
        message: 'Name and search criteria are required'
      });
    }

    const user = await User.findById(req.user.id);
    await user.createJobAlert(name, searchCriteria, frequency);

    res.status(201).json({
      success: true,
      message: 'Job alert created successfully',
      jobAlert: {
        name,
        searchCriteria,
        frequency,
        isActive: true,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Create job alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job alert'
    });
  }
};

export const updateJobAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const updates = req.body;
    
    const user = await User.findById(req.user.id);
    const alertIndex = user.jobAlerts.findIndex(alert => alert._id.toString() === alertId);
    
    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Job alert not found'
      });
    }

    user.jobAlerts[alertIndex] = {
      ...user.jobAlerts[alertIndex].toObject(),
      ...updates
    };

    await user.save();

    res.json({
      success: true,
      message: 'Job alert updated successfully',
      jobAlert: user.jobAlerts[alertIndex]
    });
  } catch (error) {
    console.error('Update job alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job alert'
    });
  }
};

export const deleteJobAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    
    const user = await User.findById(req.user.id);
    user.jobAlerts = user.jobAlerts.filter(alert => alert._id.toString() !== alertId);
    
    await user.save();

    res.json({
      success: true,
      message: 'Job alert deleted successfully'
    });
  } catch (error) {
    console.error('Delete job alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job alert'
    });
  }
};

// ===== JOB ALERT TRIGGERING =====
export const triggerJobAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    
    const user = await User.findById(req.user.id);
    const alert = user.jobAlerts.find(a => a._id.toString() === alertId);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Job alert not found'
      });
    }

    const matchingJobs = await findMatchingJobs(alert.searchCriteria);
    alert.lastSent = new Date();
    await user.save();

    res.json({
      success: true,
      message: `Found ${matchingJobs.length} matching jobs`,
      jobs: matchingJobs,
      alert: {
        name: alert.name,
        criteria: alert.searchCriteria
      }
    });
  } catch (error) {
    console.error('Trigger job alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error triggering job alert'
    });
  }
};

// ===== HELPER FUNCTIONS =====
const findMatchingJobs = async (criteria) => {
  let query = { status: 'active' };
  
  if (criteria.keywords) {
    query.$or = [
      { title: { $regex: criteria.keywords, $options: 'i' } },
      { description: { $regex: criteria.keywords, $options: 'i' } },
      { company: { $regex: criteria.keywords, $options: 'i' } }
    ];
  }
  
  if (criteria.location) {
    query['location.city'] = { $regex: criteria.location, $options: 'i' };
  }
  
  if (criteria.province) {
    query['location.province'] = criteria.province;
  }
  
  if (criteria.category) {
    query.category = criteria.category;
  }
  
  if (criteria.type) {
    query.type = criteria.type;
  }
  
  if (criteria.salaryMin) {
    query.$or = [
      { 'salary.min': { $gte: parseInt(criteria.salaryMin) } },
      { 'salary.max': { $gte: parseInt(criteria.salaryMin) } }
    ];
  }
  
  if (criteria.remote) {
    query.type = 'Remote';
  }

  return await Job.find(query)
    .populate('employer', 'name company profile.avatar')
    .sort({ featured: -1, createdAt: -1 })
    .limit(50);
};