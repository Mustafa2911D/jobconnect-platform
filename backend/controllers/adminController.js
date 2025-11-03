import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import mongoose from 'mongoose';

// ===== ANALYTICS & REPORTING =====
export const getPlatformAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalStats,
      growthMetrics,
      recentActivity,
      popularSearches,
      userDemographics,
      revenueStats
    ] = await Promise.all([
      getTotalStats(),
      getGrowthMetrics(thirtyDaysAgo),
      getRecentActivity(),
      getPopularSearches(),
      getUserDemographics(),
      getRevenueStats(thirtyDaysAgo)
    ]);

    res.json({
      success: true,
      analytics: {
        ...totalStats,
        growthMetrics,
        recentActivity,
        popularSearches: popularSearches.slice(0, 10),
        userDemographics,
        revenueStats,
        systemHealth: await getSystemHealth()
      }
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching platform analytics'
    });
  }
};

const getTotalStats = async () => {
  const [
    totalJobs,
    totalUsers,
    totalApplications,
    activeJobs,
    featuredJobs
  ] = await Promise.all([
    Job.countDocuments(),
    User.countDocuments(),
    Application.countDocuments(),
    Job.countDocuments({ status: 'active' }),
    Job.countDocuments({ featured: true, status: 'active' })
  ]);

  return {
    totalJobs,
    totalUsers,
    totalApplications,
    activeJobs,
    featuredJobs,
    conversionRate: totalJobs > 0 ? (totalApplications / totalJobs).toFixed(2) : 0
  };
};

const getGrowthMetrics = async (sinceDate) => {
  const [
    newUsers,
    newJobs,
    newApplications,
    activeUsers
  ] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: sinceDate } }),
    Job.countDocuments({ createdAt: { $gte: sinceDate } }),
    Application.countDocuments({ createdAt: { $gte: sinceDate } }),
    User.countDocuments({ 'stats.lastActive': { $gte: sinceDate } })
  ]);

  const previousPeriod = new Date(sinceDate);
  previousPeriod.setDate(previousPeriod.getDate() - 30);

  const [
    prevNewUsers,
    prevNewJobs
  ] = await Promise.all([
    User.countDocuments({ 
      createdAt: { 
        $gte: previousPeriod, 
        $lt: sinceDate 
      } 
    }),
    Job.countDocuments({ 
      createdAt: { 
        $gte: previousPeriod, 
        $lt: sinceDate 
      } 
    })
  ]);

  const userGrowth = prevNewUsers > 0 ? ((newUsers - prevNewUsers) / prevNewUsers * 100).toFixed(1) : 100;
  const jobGrowth = prevNewJobs > 0 ? ((newJobs - prevNewJobs) / prevNewJobs * 100).toFixed(1) : 100;

  return {
    newUsers,
    newJobs,
    newApplications,
    activeUsers,
    userGrowth: parseFloat(userGrowth),
    jobGrowth: parseFloat(jobGrowth)
  };
};

const getRecentActivity = async () => {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  return await Application.aggregate([
    {
      $match: {
        createdAt: { $gte: oneDayAgo }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'candidate',
        foreignField: '_id',
        as: 'candidate'
      }
    },
    {
      $lookup: {
        from: 'jobs',
        localField: 'job',
        foreignField: '_id',
        as: 'job'
      }
    },
    { $unwind: '$candidate' },
    { $unwind: '$job' },
    {
      $project: {
        candidateName: '$candidate.name',
        jobTitle: '$job.title',
        company: '$job.company',
        status: '$status',
        createdAt: 1
      }
    },
    { $sort: { createdAt: -1 } },
    { $limit: 20 }
  ]);
};

const getPopularSearches = async () => {
  return await Job.aggregate([
    { $match: { status: 'active' } },
    { 
      $group: { 
        _id: '$title', 
        count: { $sum: 1 },
        avgSalary: { $avg: '$salary.min' },
        applications: { $sum: '$stats.applications' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 15 },
    { 
      $project: { 
        title: '$_id', 
        count: 1, 
        avgSalary: { $round: ['$avgSalary', 0] },
        applications: 1,
        _id: 0 
      }
    }
  ]);
};

const getUserDemographics = async () => {
  return await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        byProvince: {
          $push: {
            province: '$profile.location.province',
            count: 1
          }
        }
      }
    },
    {
      $project: {
        role: '$_id',
        count: 1,
        topProvinces: {
          $slice: [
            {
              $reduce: {
                input: '$byProvince',
                initialValue: [],
                in: {
                  $concatArrays: [
                    '$$value',
                    {
                      $cond: [
                        { $in: ['$$this.province', '$$value.province'] },
                        [],
                        ['$$this']
                      ]
                    }
                  ]
                }
              }
            },
            5
          ]
        },
        _id: 0
      }
    }
  ]);
};

const getRevenueStats = async (sinceDate) => {
  return {
    totalRevenue: 0,
    featuredJobRevenue: 0,
    premiumMemberships: 0,
    revenueGrowth: 0
  };
};

const getSystemHealth = async () => {
  try {
    // Database health check
    const dbStats = await mongoose.connection.db.admin().serverStatus();
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    
    return {
      database: {
        connections: dbStats.connections ? dbStats.connections.current : 0,
        uptime: dbStats.uptime || 0,
        healthy: true
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        usage: ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(1)
      },
      uptime: process.uptime(),
      timestamp: new Date()
    };
  } catch (error) {
    console.error('System health check error:', error);
    return {
      database: { healthy: false, error: error.message },
      memory: { healthy: false },
      uptime: process.uptime(),
      timestamp: new Date()
    };
  }
};

// ===== USER MANAGEMENT =====
export const manageUsers = async (req, res) => {
  try {
    const { action, userIds, data } = req.body;
    
    if (!action || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'Action and user IDs are required'
      });
    }

    let result;
    
    switch (action) {
      case 'activate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { $set: { isActive: true } }
        );
        break;
        
      case 'deactivate':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { $set: { isActive: false } }
        );
        break;
        
      case 'delete':
        result = await User.deleteMany({ _id: { $in: userIds } });
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    res.json({
      success: true,
      message: `Users ${action} successfully`,
      modifiedCount: result.modifiedCount || result.deletedCount
    });
  } catch (error) {
    console.error('Manage users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error managing users'
    });
  }
};

// ===== JOB MANAGEMENT =====
export const manageJobs = async (req, res) => {
  try {
    const { action, jobIds, data } = req.body;
    
    if (!action || !jobIds || !Array.isArray(jobIds)) {
      return res.status(400).json({
        success: false,
        message: 'Action and job IDs are required'
      });
    }

    let result;
    
    switch (action) {
      case 'approve':
        result = await Job.updateMany(
          { _id: { $in: jobIds } },
          { $set: { status: 'active' } }
        );
        break;
        
      case 'reject':
        result = await Job.updateMany(
          { _id: { $in: jobIds } },
          { $set: { status: 'closed' } }
        );
        break;
        
      case 'feature':
        result = await Job.updateMany(
          { _id: { $in: jobIds } },
          { $set: { featured: true } }
        );
        break;
        
      case 'unfeature':
        result = await Job.updateMany(
          { _id: { $in: jobIds } },
          { $set: { featured: false } }
        );
        break;
        
      case 'delete':
        result = await Job.deleteMany({ _id: { $in: jobIds } });
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    res.json({
      success: true,
      message: `Jobs ${action} successfully`,
      modifiedCount: result.modifiedCount || result.deletedCount
    });
  } catch (error) {
    console.error('Manage jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error managing jobs'
    });
  }
};