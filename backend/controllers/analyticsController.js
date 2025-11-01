import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// ===== CANDIENT ANALYTICS =====
export const getCandidateAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('🔍 Fetching candidate analytics for user:', userId);
    
    const applications = await Application.find({ candidate: userId })
      .populate('job', 'title company location skills requirements')
      .sort({ createdAt: -1 });

    const applicationStats = {
      pending: applications.filter(app => app.status === 'pending').length,
      reviewed: applications.filter(app => app.status === 'reviewed').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    };

    const totalApplications = applications.length;
    const successRate = totalApplications > 0 ? 
      ((applicationStats.accepted / totalApplications) * 100).toFixed(1) : 0;

    const user = await User.findById(userId);
    const profileViews = user.stats?.profileViews || 0;
    const userSkills = user.skills || [];

    const applicationTrends = generateApplicationTrends(applications);
    const skillsInDemand = await getSkillsInDemand(userId, userSkills);
    const jobMatches = await getJobMatches(userId, applications);
    const recommendations = await getCareerRecommendations(userId, applicationStats, totalApplications, userSkills);

    const analytics = {
      totalApplications,
      successRate: parseFloat(successRate),
      profileViews,
      jobMatches: jobMatches.length,
      applicationStats,
      applicationTrends,
      skillsInDemand: skillsInDemand.slice(0, 8),
      recentApplications: applications.slice(0, 5),
      careerStats: {
        totalApplications,
        interviews: applicationStats.reviewed + applicationStats.accepted,
        offers: applicationStats.accepted,
        profileCompletion: calculateProfileCompletion(user),
        skillsVerified: userSkills.length
      },
      recommendations
    };

    console.log('✅ Candidate analytics generated:', {
      totalApplications,
      successRate: analytics.successRate,
      profileViews,
      jobMatches: analytics.jobMatches
    });

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching candidate analytics',
      error: error.message
    });
  }
};

// ===== EMPLOYER ANALYTICS =====
export const getEmployerAnalytics = async (req, res) => {
  try {
    const employerId = req.user.id;
    
    console.log('🔍 Fetching employer analytics for user:', employerId);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const employerJobs = await Job.find({ employer: employerId });
    const jobIds = employerJobs.map(job => job._id);

    if (employerJobs.length === 0) {
      return res.json({
        success: true,
        analytics: getEmptyEmployerAnalytics()
      });
    }

    const [
      jobStats,
      applicationStats,
      recentApplications,
      allApplications
    ] = await Promise.all([
      Job.aggregate([
        { $match: { _id: { $in: jobIds } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalViews: { $sum: { $ifNull: ['$stats.views', 0] } },
            totalApplications: { $sum: { $ifNull: ['$stats.applications', 0] } }
          }
        }
      ]),
      Application.aggregate([
        { $match: { job: { $in: jobIds } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgResponseTime: { 
              $avg: { 
                $cond: [
                  { $ne: ['$updatedAt', '$createdAt'] },
                  { $subtract: ['$updatedAt', '$createdAt'] },
                  null
                ]
              } 
            }
          }
        }
      ]),
      Application.find({ job: { $in: jobIds } })
        .populate('candidate', 'name email profile.headline profile.avatar skills')
        .populate('job', 'title company')
        .sort({ createdAt: -1 })
        .limit(5),
      Application.find({ job: { $in: jobIds } })
    ]);

    const totalJobs = employerJobs.length;
    const activeJobs = employerJobs.filter(job => job.status === 'active').length;
    const totalApplications = allApplications.length;
    const pendingApplications = allApplications.filter(app => app.status === 'pending').length;
    const totalViews = jobStats.reduce((sum, stat) => sum + (stat.totalViews || 0), 0);
    const overallConversionRate = totalViews > 0 ? 
      (totalApplications / totalViews * 100).toFixed(2) : 0;

    const pendingApps = allApplications.filter(app => app.status === 'pending');
    const avgResponseTime = pendingApps.length > 0 ? 
      Math.round(pendingApps.reduce((sum, app) => {
        const responseTime = app.updatedAt ? 
          (app.updatedAt - app.createdAt) / (1000 * 60 * 60 * 24) : 0;
        return sum + responseTime;
      }, 0) / pendingApps.length) : 0;

    const popularJobs = employerJobs
      .sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0))
      .slice(0, 5)
      .map(job => ({
        _id: job._id,
        title: job.title,
        views: job.stats?.views || 0,
        applications: job.stats?.applications || 0,
        conversionRate: job.stats?.views > 0 ? 
          ((job.stats?.applications || 0) / job.stats.views * 100).toFixed(2) : 0
      }));

    const conversionTrends = await generateConversionTrends(employerId, thirtyDaysAgo);

    const formattedApplicationStats = {
      pending: allApplications.filter(app => app.status === 'pending').length,
      reviewed: allApplications.filter(app => app.status === 'reviewed').length,
      accepted: allApplications.filter(app => app.status === 'accepted').length,
      rejected: allApplications.filter(app => app.status === 'rejected').length
    };

    const analytics = {
      overview: {
        totalJobs,
        totalViews,
        totalApplications,
        overallConversionRate: parseFloat(overallConversionRate),
        activeJobs,
        draftJobs: employerJobs.filter(job => job.status === 'draft').length,
        closedJobs: employerJobs.filter(job => job.status === 'closed').length,
        pendingApplications,
        avgResponseTime: avgResponseTime || 2
      },
      applicationStats: formattedApplicationStats,
      popularJobs,
      conversionTrends,
      recentApplications: recentApplications.map(app => ({
        _id: app._id,
        candidate: {
          name: app.candidate?.name,
          email: app.candidate?.email,
          headline: app.candidate?.profile?.headline,
          avatar: app.candidate?.profile?.avatar
        },
        job: {
          title: app.job?.title,
          company: app.job?.company
        },
        status: app.status,
        createdAt: app.createdAt
      })),
      employerStats: {
        totalJobsPosted: totalJobs,
        activeJobs,
        totalApplications,
        conversionRate: parseFloat(overallConversionRate),
        avgResponseTime: avgResponseTime || 2
      },
      recommendations: await getEmployerRecommendations(employerId),
      performanceMetrics: {
        applicationResponseRate: calculateResponseRate(allApplications),
        candidateSatisfaction: calculateCandidateSatisfaction(allApplications),
        timeToHire: calculateTimeToHire(allApplications)
      }
    };

    console.log('✅ Employer analytics generated with consistent data:', {
      totalJobs,
      totalApplications,
      activeJobs,
      conversionRate: analytics.overview.overallConversionRate
    });

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('❌ Employer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employer analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===== HELPER FUNCTIONS - CANDIDATE =====
const generateApplicationTrends = (applications) => {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = date.toLocaleString('default', { month: 'short' });
    months.push({ date: monthName, applications: 0, interviews: 0 });
  }

  applications.forEach(app => {
    const appDate = new Date(app.createdAt);
    const appMonth = appDate.toLocaleString('default', { month: 'short' });
    const monthIndex = months.findIndex(m => m.date === appMonth);
    
    if (monthIndex !== -1) {
      months[monthIndex].applications++;
      
      if (app.status === 'reviewed' || app.status === 'accepted') {
        months[monthIndex].interviews++;
      }
    }
  });

  return months;
};

const getSkillsInDemand = async (userId, userSkills) => {
  try {
    const user = await User.findById(userId);
    const province = user.profile?.location?.province;

    const matchStage = province ? { 'location.province': province } : {};

    const skillsData = await Job.aggregate([
      { $match: { ...matchStage, status: 'active' } },
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          count: { $sum: 1 },
          avgSalary: { $avg: '$salary.min' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
      {
        $project: {
          skill: '$_id',
          demand: { $multiply: [{ $divide: ['$count', { $size: '$skills' }] }, 100] },
          avgSalary: { $round: ['$avgSalary', 0] },
          _id: 0
        }
      }
    ]);

    return skillsData.map(skillData => ({
      ...skillData,
      hasSkill: userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skillData.skill.toLowerCase()) ||
        skillData.skill.toLowerCase().includes(userSkill.toLowerCase())
      ),
      demand: Math.min(skillData.demand, 100)
    }));
  } catch (error) {
    console.error('Skills in demand error:', error);
    
    return [
      { skill: 'JavaScript', demand: 85, avgSalary: 650000, hasSkill: userSkills.includes('JavaScript') },
      { skill: 'React', demand: 78, avgSalary: 620000, hasSkill: userSkills.includes('React') },
      { skill: 'Node.js', demand: 72, avgSalary: 680000, hasSkill: userSkills.includes('Node.js') },
      { skill: 'Python', demand: 88, avgSalary: 720000, hasSkill: userSkills.includes('Python') },
      { skill: 'TypeScript', demand: 75, avgSalary: 670000, hasSkill: userSkills.includes('TypeScript') }
    ];
  }
};

const getJobMatches = async (userId, applications) => {
  try {
    const candidate = await User.findById(userId);
    const jobs = await Job.find({ status: 'active' })
      .populate('employer', 'name company')
      .limit(50);

    return jobs.map(job => {
      const score = calculateMatchScore(candidate, job);
      return { 
        job: { _id: job._id, title: job.title, company: job.company },
        matchScore: Math.round(score)
      };
    })
    .filter(match => match.matchScore > 60)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
  } catch (error) {
    console.error('Job matching error:', error);
    return [];
  }
};

const calculateMatchScore = (candidate, job) => {
  let score = 0;
  
  const candidateSkills = candidate.skills || [];
  const jobSkills = job.skills || [];
  const skillMatch = calculateSkillMatch(candidateSkills, jobSkills);
  score += skillMatch * 40;
  
  const experienceMatch = calculateExperienceMatch(candidate.experience || [], job.requirements || []);
  score += experienceMatch * 25;
  
  const locationMatch = calculateLocationMatch(candidate.profile?.location, job.location);
  score += locationMatch * 20;
  
  const salaryMatch = calculateSalaryMatch(candidate, job);
  score += salaryMatch * 15;
  
  return Math.min(score, 100);
};

const calculateSkillMatch = (candidateSkills, jobSkills) => {
  if (!jobSkills.length) return 0.5;
  
  const matchingSkills = candidateSkills.filter(skill => 
    jobSkills.some(jobSkill => 
      jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );
  
  return matchingSkills.length / jobSkills.length;
};

const calculateExperienceMatch = (candidateExperience, jobRequirements) => {
  const totalExperience = candidateExperience.reduce((total, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : new Date(exp.endDate);
    const years = (end - start) / (365 * 24 * 60 * 60 * 1000);
    return total + Math.max(0, years);
  }, 0);

  return Math.min(totalExperience / 5, 1);
};

const calculateLocationMatch = (candidateLocation, jobLocation) => {
  if (!candidateLocation?.province) return 0.5;
  
  if (jobLocation.province === 'Remote') return 0.9;
  if (candidateLocation.province === jobLocation.province) {
    if (candidateLocation.city === jobLocation.city) return 1;
    return 0.8;
  }
  
  return 0.3;
};

const calculateSalaryMatch = (candidate, job) => {
  if (!job.salary?.min) return 0.7;
  
  const candidateExpected = candidate.profile?.expectedSalary || 500000;
  const jobSalary = job.salary.min;
  
  if (jobSalary >= candidateExpected * 0.8) return 1;
  if (jobSalary >= candidateExpected * 0.6) return 0.7;
  return 0.3;
};

const calculateProfileCompletion = (user) => {
  let completion = 0;
  
  if (user.name) completion += 15;
  if (user.email) completion += 10;
  if (user.profile?.headline) completion += 15;
  if (user.profile?.bio) completion += 15;
  if (user.skills?.length > 0) completion += 20;
  if (user.experience?.length > 0) completion += 15;
  if (user.education?.length > 0) completion += 10;
  
  return Math.min(completion, 100);
};

const getCareerRecommendations = async (userId, applicationStats, totalApplications, userSkills) => {
  const recommendations = [];
  
  if (totalApplications === 0) {
    recommendations.push({
      type: 'START_APPLYING',
      title: 'Start Your Job Search',
      description: 'Apply to 3-5 relevant positions to begin tracking your progress',
      priority: 10,
      action: 'Browse Jobs'
    });
  } else if (totalApplications < 5) {
    recommendations.push({
      type: 'INCREASE_VOLUME',
      title: 'Increase Application Volume',
      description: 'Apply to more positions to increase your chances of getting interviews',
      priority: 8,
      action: 'Find More Jobs'
    });
  }
  
  const successRate = totalApplications > 0 ? (applicationStats.accepted / totalApplications) * 100 : 0;
  if (successRate < 10 && totalApplications > 3) {
    recommendations.push({
      type: 'IMPROVE_QUALITY',
      title: 'Improve Application Quality',
      description: 'Focus on tailoring your resume and cover letter for each position',
      priority: 9,
      action: 'Update Resume'
    });
  }
  
  if (userSkills.length < 3) {
    recommendations.push({
      type: 'ADD_SKILLS',
      title: 'Enhance Your Skills',
      description: 'Add more relevant skills to your profile to increase job matches',
      priority: 7,
      action: 'Edit Profile'
    });
  }
  
  const user = await User.findById(userId);
  const profileCompletion = calculateProfileCompletion(user);
  if (profileCompletion < 70) {
    recommendations.push({
      type: 'COMPLETE_PROFILE',
      title: 'Complete Your Profile',
      description: `Your profile is ${profileCompletion}% complete. A complete profile gets 3x more views.`,
      priority: 8,
      action: 'Complete Profile'
    });
  }
  
  if (applicationStats.pending > 5 && applicationStats.reviewed === 0) {
    recommendations.push({
      type: 'FOLLOW_UP',
      title: 'Follow Up on Applications',
      description: 'Consider following up on applications older than 2 weeks',
      priority: 6,
      action: 'View Applications'
    });
  }
  
  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 4);
};

// ===== HELPER FUNCTIONS - EMPLOYER =====
const calculateResponseRate = (applications) => {
  const respondedApplications = applications.filter(app => 
    app.status !== 'pending' && app.updatedAt !== app.createdAt
  );
  return applications.length > 0 ? 
    (respondedApplications.length / applications.length * 100).toFixed(1) : 0;
};

const calculateCandidateSatisfaction = (applications) => {
  const acceptedApps = applications.filter(app => app.status === 'accepted').length;
  const reviewedApps = applications.filter(app => app.status === 'reviewed').length;
  const totalProcessed = acceptedApps + reviewedApps;
  
  return totalProcessed > 0 ? 
    ((acceptedApps * 1 + reviewedApps * 0.7) / totalProcessed * 100).toFixed(1) : 95;
};

const calculateTimeToHire = (applications) => {
  const hiredApplications = applications.filter(app => app.status === 'accepted');
  if (hiredApplications.length === 0) return 14;
  
  const totalTime = hiredApplications.reduce((sum, app) => {
    const hireTime = (app.updatedAt - app.createdAt) / (1000 * 60 * 60 * 24);
    return sum + hireTime;
  }, 0);
  
  return Math.round(totalTime / hiredApplications.length);
};

const getEmptyEmployerAnalytics = () => {
  return {
    overview: {
      totalJobs: 0,
      totalViews: 0,
      totalApplications: 0,
      overallConversionRate: 0,
      activeJobs: 0,
      draftJobs: 0,
      closedJobs: 0
    },
    applicationStats: {},
    popularJobs: [],
    conversionTrends: [],
    recentApplications: [],
    employerStats: {
      totalJobsPosted: 0,
      activeJobs: 0,
      totalApplications: 0,
      conversionRate: 0
    },
    recommendations: [
      {
        type: 'CREATE_FIRST_JOB',
        title: 'Create Your First Job Post',
        description: 'Start by creating your first job posting to attract candidates',
        priority: 10,
        action: 'Create Job'
      }
    ]
  };
};

const generateConversionTrends = async (employerId, startDate) => {
  try {
    const jobs = await Job.find({ 
      employer: employerId,
      createdAt: { $gte: startDate }
    });

    const trendsMap = {};
    
    jobs.forEach(job => {
      const date = job.createdAt.toISOString().split('T')[0];
      if (!trendsMap[date]) {
        trendsMap[date] = {
          date,
          views: 0,
          applications: 0
        };
      }
      
      trendsMap[date].views += job.stats?.views || 0;
      trendsMap[date].applications += job.stats?.applications || 0;
    });

    return Object.values(trendsMap)
      .map(trend => ({
        ...trend,
        conversionRate: trend.views > 0 ? (trend.applications / trend.views * 100).toFixed(2) : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error generating conversion trends:', error);
    return [];
  }
};

const getEmployerStats = async (employerId) => {
  const totalJobs = await Job.countDocuments({ employer: employerId });
  const activeJobs = await Job.countDocuments({ employer: employerId, status: 'active' });
  
  const applications = await Application.countDocuments({
    job: { $in: await Job.find({ employer: employerId }).select('_id') }
  });
  
  return {
    totalJobsPosted: totalJobs,
    activeJobs,
    totalApplications: applications,
    conversionRate: totalJobs > 0 ? (applications / totalJobs) : 0,
    avgResponseTime: 2
  };
};

const getEmployerRecommendations = async (employerId) => {
  const recommendations = [];
  
  const jobs = await Job.find({ employer: employerId });
  
  const noApplicationJobs = jobs.filter(job => 
    !job.stats?.applications || job.stats.applications === 0
  );
  
  if (noApplicationJobs.length > 0) {
    recommendations.push({
      type: 'PROMOTE_JOBS',
      title: 'Promote Your Job Posts',
      description: `${noApplicationJobs.length} job(s) have no applications yet`,
      priority: 8,
      action: 'Share Jobs'
    });
  }
  
  const draftJobs = jobs.filter(job => job.status === 'draft');
  if (draftJobs.length > 0) {
    recommendations.push({
      type: 'PUBLISH_DRAFTS',
      title: 'Publish Draft Jobs',
      description: `You have ${draftJobs.length} draft job(s) ready to publish`,
      priority: 7,
      action: 'View Drafts'
    });
  }
  
  if (jobs.length < 3) {
    recommendations.push({
      type: 'CREATE_MORE_JOBS',
      title: 'Create More Job Posts',
      description: 'Increase your chances by posting more job opportunities',
      priority: 6,
      action: 'Create Job'
    });
  }
  
  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 5);
};