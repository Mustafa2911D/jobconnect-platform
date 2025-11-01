import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// ===== JOB SEARCH & DISCOVERY =====
export const getJobs = async (req, res) => {
  try {
    const { 
      search, 
      location, 
      province,
      type, 
      category,
      salaryMin,
      salaryMax,
      experience,
      remote,
      bbBee,
      featured,
      urgent,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1, 
      limit = 10 
    } = req.query;
    
    let query = { status: 'active' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (province) {
      query['location.province'] = province;
    }
    
    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }
    
    if (salaryMin || salaryMax) {
      query.$and = [];
      if (salaryMin) {
        query.$and.push({
          $or: [
            { 'salary.min': { $gte: parseInt(salaryMin) } },
            { 'salary.max': { $gte: parseInt(salaryMin) } }
          ]
        });
      }
      if (salaryMax) {
        query.$and.push({
          $or: [
            { 'salary.max': { $lte: parseInt(salaryMax) } },
            { 'salary.min': { $lte: parseInt(salaryMax) } }
          ]
        });
      }
    }
    
    if (bbBee === 'true') {
      query['saRequirements.bbBee'] = true;
    }
    
    if (remote === 'true') {
      query.type = 'Remote';
    }

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (urgent === 'true') {
      query.urgent = true;
    }

    const sortOptions = {};
    const validSortFields = ['createdAt', 'salary.min', 'salary.max', 'stats.views'];
    const validSortOrder = ['asc', 'desc'];
    
    if (validSortFields.includes(sortBy) && validSortOrder.includes(sortOrder)) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    sortOptions.featured = -1;
    sortOptions.urgent = -1;

    const jobs = await Job.find(query)
      .populate('employer', 'name company profile.avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Job.countDocuments(query);
    const popularSearches = await getPopularSearches();

    res.json({
      success: true,
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      popularSearches
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching jobs'
    });
  }
};

export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'name company profile.avatar profile.contact profile.bio');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await Job.findByIdAndUpdate(req.params.id, { 
      $inc: { 'stats.views': 1, 'stats.uniqueViews': 1 } 
    });

    const similarJobs = await Job.find({
      _id: { $ne: job._id },
      $or: [
        { category: job.category },
        { 'location.province': job.location.province },
        { skills: { $in: job.skills } }
      ],
      status: 'active'
    })
    .populate('employer', 'name company profile.avatar')
    .limit(4)
    .sort({ featured: -1, createdAt: -1 });

    res.json({
      success: true,
      job,
      similarJobs
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job'
    });
  }
};

export const getJobTrends = async (req, res) => {
  try {
    const trends = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          totalJobs: { $sum: 1 },
          avgSalary: { $avg: '$salary.min' },
          popularSkills: { $push: '$skills' }
        }
      },
      {
        $project: {
          category: '$_id',
          totalJobs: 1,
          avgSalary: { $round: ['$avgSalary', 0] },
          _id: 0
        }
      },
      { $sort: { totalJobs: -1 } }
    ]);

    res.json({
      success: true,
      trends
    });
  } catch (error) {
    console.error('Get job trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job trends'
    });
  }
};

// ===== JOB MANAGEMENT =====
export const createJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const jobData = {
      ...req.body,
      employer: req.user.id,
      requirements: Array.isArray(req.body.requirements) 
        ? req.body.requirements 
        : req.body.requirements.split(',').map(req => req.trim()),
      skills: Array.isArray(req.body.skills) 
        ? req.body.skills 
        : req.body.skills?.split(',').map(skill => skill.trim()) || [],
      benefits: Array.isArray(req.body.benefits) 
        ? req.body.benefits 
        : req.body.benefits?.split(',').map(benefit => benefit.trim()) || []
    };

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating job'
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    const updateData = { ...req.body };
    
    if (req.body.requirements) {
      if (typeof req.body.requirements === 'string') {
        updateData.requirements = req.body.requirements.split(',').map(req => req.trim()).filter(req => req);
      } else if (Array.isArray(req.body.requirements)) {
        updateData.requirements = req.body.requirements;
      }
    }
    
    if (req.body.skills) {
      if (typeof req.body.skills === 'string') {
        updateData.skills = req.body.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
      } else if (Array.isArray(req.body.skills)) {
        updateData.skills = req.body.skills;
      }
    }
    
    if (req.body.benefits) {
      if (typeof req.body.benefits === 'string') {
        updateData.benefits = req.body.benefits.split(',').map(benefit => benefit.trim()).filter(benefit => benefit);
      } else if (Array.isArray(req.body.benefits)) {
        updateData.benefits = req.body.benefits;
      }
    }

    console.log('🔄 Updating job with data:', updateData);

    job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    );

    console.log('✅ Job updated successfully:', job._id);

    res.json({
      success: true,
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('❌ Update job error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ job: req.params.id });

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting job'
    });
  }
};

export const bulkUpdateJobs = async (req, res) => {
  try {
    const { jobIds, updates } = req.body;
    
    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job IDs are required'
      });
    }

    const jobs = await Job.find({ 
      _id: { $in: jobIds }, 
      employer: req.user.id 
    });

    if (jobs.length !== jobIds.length) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update some jobs'
      });
    }

    const result = await Job.updateMany(
      { _id: { $in: jobIds } },
      updates
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} jobs updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating jobs'
    });
  }
};

// ===== EMPLOYER JOB OPERATIONS =====
export const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id })
      .populate('employer')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employer jobs'
    });
  }
};

export const getJobStats = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view stats for this job'
      });
    }

    const applications = await Application.find({ job: req.params.id });
    const applicationStats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      reviewed: applications.filter(app => app.status === 'reviewed').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    };

    res.json({
      success: true,
      stats: {
        job: job.stats,
        applications: applicationStats
      }
    });
  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job stats'
    });
  }
};

// ===== HELPER FUNCTIONS =====
const getPopularSearches = async () => {
  try {
    return await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { 
        _id: '$title', 
        count: { $sum: 1 },
        avgSalary: { $avg: '$salary.min' }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { 
        title: '$_id', 
        count: 1, 
        avgSalary: { $round: ['$avgSalary', 0] },
        _id: 0 
      }}
    ]);
  } catch (error) {
    console.error('Error getting popular searches:', error);
    return [];
  }
};