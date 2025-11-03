import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['employer', 'candidate'],
    required: true
  },
  profileImage: {
    type: String,
    default: null
  },
  profile: {
    headline: String,
    bio: String,
    avatar: String,
    coverPhoto: String,
    location: {
      province: {
        type: String,
        enum: ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape']
      },
      city: String,
      address: String
    },
    contact: {
      phone: String,
      linkedin: String,
      website: String
    },
    preferences: {
      jobAlerts: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: true },
      privacy: { type: String, enum: ['public', 'private', 'connections'], default: 'public' },
      notificationFrequency: { type: String, enum: ['instant', 'daily', 'weekly'], default: 'instant' },
      
      notifications: {
        newApplications: { type: Boolean, default: true },
        candidateMessages: { type: Boolean, default: true },
        jobExpiry: { type: Boolean, default: true },
        jobAlerts: { type: Boolean, default: true },
        applicationUpdates: { type: Boolean, default: true },
        newMessages: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: false },
        pushNotifications: { type: Boolean, default: true },
        emailDigest: { type: Boolean, default: true },
        urgentAlerts: { type: Boolean, default: true }
      },
      privacySettings: {
        profileVisibility: { type: String, enum: ['public', 'private', 'connections'], default: 'public' },
        showEmail: { type: Boolean, default: false },
        showPhone: { type: Boolean, default: false },
        allowMessages: { type: Boolean, default: true },
        dataSharing: { type: Boolean, default: false },
        searchVisibility: { type: Boolean, default: true },
        activityStatus: { type: Boolean, default: true },
        twoFactorAuth: { type: Boolean, default: false }
      },
      appearance: {
        theme: { type: String, enum: ['light', 'dark'], default: 'light' },
        fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
        density: { type: String, enum: ['compact', 'comfortable', 'spacious'], default: 'comfortable' },
        reduceAnimations: { type: Boolean, default: false },
        highContrast: { type: Boolean, default: false },
        colorBlind: { type: Boolean, default: false }
      },
      regional: {
        language: { type: String, default: 'en' },
        timezone: { type: String, default: 'Africa/Johannesburg' },
        currency: { type: String, default: 'ZAR' },
        province: { 
          type: String, 
          enum: ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape'],
          default: 'Gauteng'
        },
        dateFormat: { type: String, default: 'DD/MM/YYYY' },
        temperature: { type: String, enum: ['celsius', 'fahrenheit'], default: 'celsius' }
      }
    }
  },
  resume: {
    type: String,
    default: null
  },
  company: {
    type: String,
    required: function() {
      return this.role === 'employer';
    }
  },
  companyProfile: {
    name: String,
    industry: String,
    size: String,
    founded: Number,
    description: String,
    mission: String,
    culture: String,
    benefits: [String],
    website: String,
    logo: String,
    contact: {
      email: String,
      phone: String,
      address: String
    },
    social: {
      linkedin: String,
      twitter: String,
      facebook: String
    }
  },
  saIdentity: {
    idNumber: String,
    citizenship: {
      type: String,
      enum: ['South African', 'Permanent Resident', 'Work Visa', 'Other']
    },
    bbBee: {
      type: String,
      enum: ['Yes', 'No', 'Prefer not to say']
    },
    disability: {
      type: String,
      enum: ['Yes', 'No', 'Prefer not to say']
    }
  },
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      default: 'intermediate'
    },
    category: {
      type: String,
      enum: ['technical', 'design', 'business', 'soft', 'language'],
      default: 'technical'
    }
  }],
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String,
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'remote']
    },
    industry: String
  }],
  education: [{
    institution: String,
    qualification: String,
    field: String,
    startYear: Number,
    endYear: Number,
    completed: Boolean,
    grade: String,
    description: String,
    qualificationType: {
      type: String,
      enum: ['high-school', 'certificate', 'diploma', 'bachelor', 'honors', 'masters', 'phd', 'other'],
      default: 'bachelor'
    }
  }],
  savedJobs: [{
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    savedAt: { type: Date, default: Date.now },
    notes: String
  }],
  savedProfiles: [{
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    savedAt: { type: Date, default: Date.now },
    notes: String,
    tags: [String]
  }],
  jobAlerts: [{
    name: String,
    searchCriteria: {
      keywords: String,
      location: String,
      province: String,
      category: String,
      type: String,
      salaryMin: Number,
      salaryMax: Number,
      remote: Boolean
    },
    frequency: { type: String, enum: ['daily', 'weekly', 'instant'], default: 'daily' },
    isActive: { type: Boolean, default: true },
    lastSent: Date,
    createdAt: { type: Date, default: Date.now }
  }],
  pushToken: String,
  stats: {
    profileViews: { type: Number, default: 0 },
    jobApplications: { type: Number, default: 0 },
    lastActive: Date,
    searchHistory: [{
      query: String,
      timestamp: { type: Date, default: Date.now },
      results: Number
    }],
    careerStats: {
      totalApplications: { type: Number, default: 0 },
      interviews: { type: Number, default: 0 },
      offers: { type: Number, default: 0 },
      profileCompletion: { type: Number, default: 0 },
      skillsVerified: { type: Number, default: 0 }
    },
    employerStats: {
      totalJobsPosted: { type: Number, default: 0 },
      activeJobs: { type: Number, default: 0 },
      totalApplications: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      avgResponseTime: { type: Number, default: 0 }
    }
  },
  // Password reset fields
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date
}, {
  timestamps: true
});

// ===== INDEXES =====
userSchema.index({ 'stats.lastActive': -1 });
userSchema.index({ 'profile.location.province': 1 });
userSchema.index({ skills: 1 });

// ===== PRE-SAVE MIDDLEWARE =====
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ===== PASSWORD METHODS =====
userSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; 
  
  return resetToken;
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// ===== SAVED JOBS METHODS =====
userSchema.methods.addSavedJob = function(jobId, notes = '') {
  const existingIndex = this.savedJobs.findIndex(saved => saved.job.toString() === jobId.toString());
  
  if (existingIndex > -1) {
    this.savedJobs[existingIndex].notes = notes;
    this.savedJobs[existingIndex].savedAt = new Date();
  } else {
    this.savedJobs.push({ job: jobId, notes });
  }
  
  return this.save();
};

userSchema.methods.removeSavedJob = function(jobId) {
  this.savedJobs = this.savedJobs.filter(saved => saved.job.toString() !== jobId.toString());
  return this.save();
};

// ===== SAVED PROFILES METHODS =====
userSchema.methods.saveCandidateProfile = function(candidateId, notes = '', tags = []) {
  const existingIndex = this.savedProfiles.findIndex(
    saved => saved.candidate.toString() === candidateId.toString()
  );
  
  if (existingIndex > -1) {
    this.savedProfiles[existingIndex].notes = notes;
    this.savedProfiles[existingIndex].tags = tags;
    this.savedProfiles[existingIndex].savedAt = new Date();
  } else {
    this.savedProfiles.push({ candidate: candidateId, notes, tags });
  }
  
  return this.save();
};

userSchema.methods.removeSavedProfile = function(candidateId) {
  this.savedProfiles = this.savedProfiles.filter(
    saved => saved.candidate.toString() !== candidateId.toString()
  );
  return this.save();
};

userSchema.methods.getSavedProfiles = function() {
  return this.populate({
    path: 'savedProfiles.candidate',
    select: 'name email profile skills experience education stats',
    populate: [
      { path: 'experience' },
      { path: 'education' }
    ]
  });
};

// ===== JOB ALERTS METHODS =====
userSchema.methods.createJobAlert = function(name, searchCriteria, frequency = 'daily') {
  this.jobAlerts.push({ name, searchCriteria, frequency });
  return this.save();
};

// ===== STATS METHODS =====
userSchema.methods.updateCareerStats = function() {
  const totalApplications = this.stats.jobApplications || 0;
  const interviews = this.stats.careerStats?.interviews || 0;
  const offers = this.stats.careerStats?.offers || 0;
  
  let completionScore = 0;
  if (this.name) completionScore += 10;
  if (this.email) completionScore += 10;
  if (this.profile?.headline) completionScore += 15;
  if (this.profile?.bio) completionScore += 10;
  if (this.profile?.location?.province) completionScore += 10;
  if (this.profile?.contact?.phone) completionScore += 10;
  
  if (this.skills && this.skills.length > 0) {
    const hasSkills = Array.isArray(this.skills) && this.skills.length > 0;
    if (hasSkills) completionScore += 15;
  }
  
  if (this.experience?.length > 0) completionScore += 10;
  if (this.education?.length > 0) completionScore += 10;
  
  this.stats.careerStats = {
    totalApplications,
    interviews,
    offers,
    profileCompletion: Math.min(completionScore, 100),
    skillsVerified: (this.skills && this.skills.length) || 0
  };
  
  return this.save();
};

userSchema.methods.updateEmployerStats = async function() {
  const Job = mongoose.model('Job');
  const Application = mongoose.model('Application');
  
  const totalJobsPosted = await Job.countDocuments({ employer: this._id });
  const activeJobs = await Job.countDocuments({ employer: this._id, status: 'active' });
  const totalApplications = await Application.countDocuments({
    job: { $in: await Job.find({ employer: this._id }).select('_id') }
  });
  
  const applications = await Application.find({
    job: { $in: await Job.find({ employer: this._id }).select('_id') },
    status: { $in: ['reviewed', 'accepted', 'rejected'] }
  }).select('createdAt updatedAt');
  
  let totalResponseTime = 0;
  let respondedApplications = 0;
  
  applications.forEach(app => {
    const responseTime = (app.updatedAt - app.createdAt) / (1000 * 60 * 60 * 24);
    if (responseTime > 0) {
      totalResponseTime += responseTime;
      respondedApplications++;
    }
  });
  
  const avgResponseTime = respondedApplications > 0 ? totalResponseTime / respondedApplications : 0;
  
  this.stats.employerStats = {
    totalJobsPosted,
    activeJobs,
    totalApplications,
    conversionRate: totalJobsPosted > 0 ? (totalApplications / totalJobsPosted) * 100 : 0,
    avgResponseTime: Math.round(avgResponseTime * 100) / 100
  };
  
  return this.save();
};

export default mongoose.model('User', userSchema);