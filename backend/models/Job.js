import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  company: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  companyLogo: String,
  location: {
    province: {
      type: String,
      enum: ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape', 'Remote'],
      required: true,
      index: true
    },
    city: {
      type: String,
      required: true,
      index: true
    },
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Freelance'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['Information Technology', 'Finance', 'Healthcare', 'Engineering', 'Education', 'Sales & Marketing', 'Hospitality', 'Construction', 'Manufacturing', 'Government', 'Design', 'Other'],
    required: true,
    index: true
  },
  salary: {
    min: { type: Number, index: true },
    max: { type: Number, index: true },
    currency: { type: String, default: 'ZAR' },
    period: { type: String, enum: ['monthly', 'annually', 'hourly'], default: 'monthly' },
    isNegotiable: { type: Boolean, default: false }
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: [String],
    required: true
  },
  skills: [String],
  benefits: [String],
  experienceLevel: {
    type: String,
    enum: ['Entry', 'Mid', 'Senior', 'Executive'],
    default: 'Mid'
  },
  saRequirements: {
    bbBee: { type: Boolean, default: false, index: true },
    saCitizen: { type: Boolean, default: false },
    driversLicense: { type: Boolean, default: false },
    clearCriminalRecord: { type: Boolean, default: false },
    languageRequirements: [String]
  },
  application: {
    deadline: Date,
    instructions: String,
    questions: [String],
    applyUrl: String
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed', 'draft'],
    default: 'active',
    index: true
  },
  stats: {
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    source: {
      direct: { type: Number, default: 0 },
      search: { type: Number, default: 0 },
      social: { type: Number, default: 0 }
    }
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  urgent: {
    type: Boolean,
    default: false,
    index: true
  },
  tags: [String],
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: { type: String, unique: true, index: true }
  }
}, {
  timestamps: true
});

// ===== INDEXES =====
jobSchema.index({ status: 1, featured: -1, createdAt: -1 });
jobSchema.index({ 'location.province': 1, category: 1 });
jobSchema.index({ 'salary.min': 1, 'salary.max': 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ title: 'text', description: 'text', company: 'text' });

// ===== PRE-SAVE MIDDLEWARE =====
jobSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.seo.slug) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    this.seo.slug = `${baseSlug}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// ===== INSTANCE METHODS =====
jobSchema.methods.incrementView = function() {
  this.stats.views += 1;
  return this.save();
};

jobSchema.methods.incrementApplication = function() {
  this.stats.applications += 1;
  if (this.stats.views > 0) {
    this.stats.completionRate = (this.stats.applications / this.stats.views) * 100;
  }
  return this.save();
};

jobSchema.methods.incrementSave = function() {
  this.stats.saves += 1;
  return this.save();
};

export default mongoose.model('Job', jobSchema);