import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { jobsAPI } from '../../api/apiClient.js';
import { 
  ArrowLeft, Save, Briefcase, MapPin, DollarSign, Clock, 
  Users, FileText, Building, Calendar, Tag, Zap,
  Sparkles, Target, Award, Rocket, CheckCircle, Edit3,
  RefreshCw, ArrowUpRight, Eye, TrendingUp, Plus, X
} from 'lucide-react';
import { showToast } from '../../utils/toast.js';

// Reusable Form Components
const InputField = ({ label, name, value, onChange, type = "text", placeholder, required = false, className = "", onMouseEnter, onMouseLeave }) => (
  <div className={className}>
    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
      <span>{label}</span>
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400"
      placeholder={placeholder}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required = false, className = "", onMouseEnter, onMouseLeave }) => (
  <div className={className}>
    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
      <span>{label}</span>
      {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const TextAreaField = ({ label, name, value, onChange, rows = 4, placeholder, required = false, className = "", onMouseEnter, onMouseLeave }) => (
  <div className={className}>
    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
      <span>{label}</span>
      {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      rows={rows}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 resize-none"
      placeholder={placeholder}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  </div>
);

// Main Component
const EditJob = () => {
  // Hooks and State
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState(null);
  const [hoveredField, setHoveredField] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: {
      province: '',
      city: ''
    },
    type: 'Full-time',
    category: 'Information Technology',
    salary: {
      min: '',
      max: '',
      currency: 'ZAR',
      period: 'monthly',
      isNegotiable: false
    },
    description: '',
    requirements: [''],
    skills: [''],
    benefits: [''],
    experienceLevel: 'Mid',
    educationLevel: 'Bachelors',
    application: {
      deadline: '',
      instructions: '',
      questions: ['']
    },
    featured: false,
    urgent: false,
    status: 'active'
  });

  // Constants
  const provinces = [
    'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 
    'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape'
  ];

  const jobTypes = [
    'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Freelance'
  ];

  const categories = [
    'Information Technology', 'Finance', 'Healthcare', 'Engineering', 'Education', 
    'Sales & Marketing', 'Hospitality', 'Construction', 'Manufacturing', 
    'Government', 'Other'
  ];

  const experienceLevels = [
    'Entry', 'Mid', 'Senior', 'Executive'  
  ];

  const educationLevels = [
    'High School', 'Diploma', 'Bachelors', 'Masters', 'PhD'
  ];

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'green', icon: CheckCircle },
    { value: 'paused', label: 'Paused', color: 'yellow', icon: Clock },
    { value: 'closed', label: 'Closed', color: 'red', icon: CheckCircle },
    { value: 'draft', label: 'Draft', color: 'gray', icon: FileText }
  ];

  // Effects
  useEffect(() => {
    fetchJob();
  }, [jobId]);

  // Event Handlers
  const handleInputChange = (path, value) => {
    const keys = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleArrayChange = (path, index, value) => {
    const keys = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      const array = [...current[keys[keys.length - 1]]];
      array[index] = value;
      current[keys[keys.length - 1]] = array;
      return newData;
    });
  };

  const addArrayItem = (path) => {
    const keys = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = [...current[keys[keys.length - 1]], ''];
      return newData;
    });
  };

  const removeArrayItem = (path, index) => {
    const keys = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      const array = [...current[keys[keys.length - 1]]];
      array.splice(index, 1);
      current[keys[keys.length - 1]] = array;
      return newData;
    });
  };

  // API Functions
  const fetchJob = async () => {
    try {
      console.log('Fetching job with ID:', jobId);
      const response = await jobsAPI.getJob(jobId);
      console.log('Job fetch response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch job');
      }
      
      const jobData = response.data.job;
      
      if (!jobData) {
        throw new Error('No job data received');
      }
      
      setJob(jobData);
      
      // Transform backend data to match form structure
      const transformedData = {
        title: jobData.title || '',
        company: jobData.company || user?.company || '',
        location: {
          province: jobData.location?.province || '',
          city: jobData.location?.city || ''
        },
        type: jobData.type || 'Full-time',
        category: jobData.category === 'IT & Tech' ? 'Information Technology' : jobData.category || 'Information Technology',
        salary: {
          min: jobData.salary?.min?.toString() || '',
          max: jobData.salary?.max?.toString() || '',
          currency: jobData.salary?.currency || 'ZAR',
          period: jobData.salary?.period === 'annually' ? 'annually' : 'monthly',
          isNegotiable: jobData.salary?.isNegotiable || false
        },
        description: jobData.description || '',
        requirements: Array.isArray(jobData.requirements) && jobData.requirements.length > 0 
          ? jobData.requirements 
          : (jobData.requirements ? [jobData.requirements] : ['']),
        skills: Array.isArray(jobData.skills) && jobData.skills.length > 0 
          ? jobData.skills 
          : (jobData.skills ? [jobData.skills] : ['']),
        benefits: Array.isArray(jobData.benefits) && jobData.benefits.length > 0 
          ? jobData.benefits 
          : (jobData.benefits ? [jobData.benefits] : ['']),
        experienceLevel: jobData.experienceLevel || 'Mid',
        educationLevel: jobData.educationLevel || 'Bachelors',
        application: {
          deadline: jobData.applicationDeadline ? 
            new Date(jobData.applicationDeadline).toISOString().split('T')[0] : '',
          instructions: jobData.application?.instructions || '',
          questions: jobData.application?.questions || ['']
        },
        featured: jobData.featured || false,
        urgent: jobData.urgent || false,
        status: jobData.status || 'active'
      };

      setFormData(transformedData);
      
    } catch (error) {
      console.error('Error fetching job:', error);
      console.error('Error details:', error.response?.data);
      showToast(`Error loading job: ${error.message}`, 'error');
      navigate('/employer/all-applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);

  try {
    // Clean and validate data before sending
    const submitData = {
      title: formData.title?.trim(),
      company: formData.company?.trim(),
      description: formData.description?.trim(),
      requirements: formData.requirements
        .filter(req => req && req.trim && req.trim() !== '')
        .map(req => req.trim()),
      skills: formData.skills
        .filter(skill => skill && skill.trim && skill.trim() !== '')
        .map(skill => skill.trim()),
      benefits: formData.benefits
        .filter(benefit => benefit && benefit.trim && benefit.trim() !== '')
        .map(benefit => benefit.trim()),
      salary: {
        min: formData.salary.min ? parseInt(formData.salary.min) : undefined,
        max: formData.salary.max ? parseInt(formData.salary.max) : undefined,
        currency: formData.salary.currency,
        period: formData.salary.period,
        isNegotiable: formData.salary.isNegotiable
      },
      location: {
        city: formData.location.city?.trim(),
        province: formData.location.province
      },
      type: formData.type,
      category: formData.category,
      experienceLevel: formData.experienceLevel,
      educationLevel: formData.educationLevel,
      applicationDeadline: formData.application.deadline || undefined,
      application: {
        instructions: formData.application.instructions?.trim(),
        questions: formData.application.questions
          .filter(q => q && q.trim && q.trim() !== '')
          .map(q => q.trim())
      },
      featured: formData.featured,
      urgent: formData.urgent,
      status: formData.status
    };

    console.log('Submitting job update:', { jobId, submitData });
    
    const response = await jobsAPI.updateJob(jobId, submitData);
    console.log('Job update response:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update job');
    }
    
    showToast('🎉 Job updated successfully!', 'success');
    navigate('/employer/all-applications');
  } catch (error) {
    console.error('Error updating job:', error);
    console.error('Full error response:', error.response?.data);
    
    // Display specific validation errors
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
      const errorMessages = error.response.data.errors.map(err => 
        typeof err === 'object' ? err.msg || JSON.stringify(err) : err
      ).join(', ');
      
      showToast(`Validation error: ${errorMessages}`, 'error');
    } else {
      showToast(`Error updating job: ${error.response?.data?.message || error.message}`, 'error');
    }
  } finally {
    setSaving(false);
  }
};

  // Field Hover Handlers
  const handleFieldMouseEnter = (fieldName) => () => {
    setHoveredField(fieldName);
  };

  const handleFieldMouseLeave = () => {
    setHoveredField(null);
  };

  // Render array fields
  const renderArrayField = (title, path, items, placeholder, color = 'gray') => {
    return (
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
          <Target className={`h-4 w-4 text-${color}-500`} />
          <span>{title}</span>
        </label>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={`${path}-${index}`} className="flex items-center space-x-3 group">
              <div className={`w-2 h-2 bg-${color}-500 rounded-full flex-shrink-0`}></div>
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayChange(path, index, e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400"
                placeholder={placeholder.replace('{index}', index + 1)}
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem(path, index)}
                  className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addArrayItem(path)}
          className="mt-3 flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">Add {title}</span>
        </button>
      </div>
    );
  };

  // Loading States
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading job details...</p>
          <p className="text-gray-500 text-sm mt-2">Getting everything ready for editing</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="h-20 w-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h3>
          <p className="text-gray-600 text-lg mb-6">The job you're trying to edit doesn't exist.</p>
          <button
            onClick={() => navigate('/employer/all-applications')}
            className="group inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to My Jobs</span>
          </button>
        </div>
      </div>
    );
  }

  // Render Functions
  const renderStatusOptions = () => {
    return statusOptions.map((status) => {
      const StatusIcon = status.icon;
      return (
        <label 
          key={status.value} 
          className={`group relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
            formData.status === status.value
              ? `border-${status.color}-500 bg-${status.color}-50 shadow-lg`
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }`}
        >
          <input
            type="radio"
            name="status"
            value={status.value}
            checked={formData.status === status.value}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="sr-only"
          />
          <StatusIcon className={`h-6 w-6 mb-2 ${
            formData.status === status.value ? `text-${status.color}-600` : 'text-gray-400'
          } group-hover:scale-110 transition-transform duration-300`} />
          <span className={`font-semibold text-sm ${
            formData.status === status.value ? `text-${status.color}-700` : 'text-gray-700'
          }`}>
            {status.label}
          </span>
        </label>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/employer/all-applications')}
              className="group flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-all duration-300 transform hover:-translate-x-1"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to My Jobs</span>
            </button>
          </div>
          <div className="text-center lg:text-right">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Edit Job Post
            </h1>
            <p className="text-gray-600 text-lg mt-2">Update and optimize your job listing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span>Basic Information</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputField
                  label="Job Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Senior React Developer"
                  required
                  onMouseEnter={handleFieldMouseEnter('title')}
                  onMouseLeave={handleFieldMouseLeave}
                />
              </div>

              <InputField
                label="Company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Your company name"
                required
                onMouseEnter={handleFieldMouseEnter('company')}
                onMouseLeave={handleFieldMouseLeave}
              />

              <SelectField
                label="Job Type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                options={jobTypes}
                required
                onMouseEnter={handleFieldMouseEnter('type')}
                onMouseLeave={handleFieldMouseLeave}
              />

              <SelectField
                label="Category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                options={categories}
                required
                onMouseEnter={handleFieldMouseEnter('category')}
                onMouseLeave={handleFieldMouseLeave}
              />

              <SelectField
                label="Experience Level"
                value={formData.experienceLevel}
                onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                options={experienceLevels}
                onMouseEnter={handleFieldMouseEnter('experienceLevel')}
                onMouseLeave={handleFieldMouseLeave}
              />

              <SelectField
                label="Education Level"
                value={formData.educationLevel}
                onChange={(e) => handleInputChange('educationLevel', e.target.value)}
                options={educationLevels}
                onMouseEnter={handleFieldMouseEnter('educationLevel')}
                onMouseLeave={handleFieldMouseLeave}
              />
            </div>
          </div>

          {/* Location */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span>Location</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Province"
                value={formData.location.province}
                onChange={(e) => handleInputChange('location.province', e.target.value)}
                options={['', ...provinces]}
                required
                onMouseEnter={handleFieldMouseEnter('location.province')}
                onMouseLeave={handleFieldMouseLeave}
              />

              <InputField
                label="City"
                value={formData.location.city}
                onChange={(e) => handleInputChange('location.city', e.target.value)}
                placeholder="e.g., Johannesburg"
                required
                onMouseEnter={handleFieldMouseEnter('location.city')}
                onMouseLeave={handleFieldMouseLeave}
              />
            </div>
          </div>

          {/* Salary */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <span>Salary Information</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Minimum Salary (ZAR)"
                type="number"
                value={formData.salary.min}
                onChange={(e) => handleInputChange('salary.min', e.target.value)}
                placeholder="e.g., 40000"
                onMouseEnter={handleFieldMouseEnter('salary.min')}
                onMouseLeave={handleFieldMouseLeave}
              />

              <InputField
                label="Maximum Salary (ZAR)"
                type="number"
                value={formData.salary.max}
                onChange={(e) => handleInputChange('salary.max', e.target.value)}
                placeholder="e.g., 60000"
                onMouseEnter={handleFieldMouseEnter('salary.max')}
                onMouseLeave={handleFieldMouseLeave}
              />

              <SelectField
                label="Salary Period"
                value={formData.salary.period}
                onChange={(e) => handleInputChange('salary.period', e.target.value)}
                options={['monthly', 'annually']}
                onMouseEnter={handleFieldMouseEnter('salary.period')}
                onMouseLeave={handleFieldMouseLeave}
              />

              <div className="md:col-span-3">
                <label className="group flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-green-600 transition-all duration-300 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.salary.isNegotiable}
                      onChange={(e) => handleInputChange('salary.isNegotiable', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-600 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Salary is negotiable</span>
                    <p className="text-sm text-gray-600 mt-1">Show candidates that you're open to discussion</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600 transform group-hover:scale-110 transition-transform duration-300" />
                </label>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span>Job Details</span>
            </h2>
            
            <div className="space-y-6">
              <TextAreaField
                label="Job Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                placeholder="Describe the role, responsibilities, company culture, and what makes this opportunity special..."
                required
                onMouseEnter={handleFieldMouseEnter('description')}
                onMouseLeave={handleFieldMouseLeave}
              />

              {renderArrayField(
                'Requirements',
                'requirements',
                formData.requirements,
                'Requirement {index} (e.g., 3+ years of experience...)',
                'red'
              )}

              {renderArrayField(
                'Skills',
                'skills',
                formData.skills,
                'Skill {index} (e.g., React, Node.js...)',
                'yellow'
              )}

              {renderArrayField(
                'Benefits',
                'benefits',
                formData.benefits,
                'Benefit {index} (e.g., Medical aid, Flexible hours...)',
                'green'
              )}
            </div>
          </div>

          {/* Application Details */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span>Application Details</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Application Deadline"
                type="date"
                value={formData.application.deadline}
                onChange={(e) => handleInputChange('application.deadline', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                onMouseEnter={handleFieldMouseEnter('application.deadline')}
                onMouseLeave={handleFieldMouseLeave}
              />

              <TextAreaField
                label="Application Instructions"
                value={formData.application.instructions}
                onChange={(e) => handleInputChange('application.instructions', e.target.value)}
                rows={3}
                placeholder="Any specific instructions for applicants..."
                onMouseEnter={handleFieldMouseEnter('application.instructions')}
                onMouseLeave={handleFieldMouseLeave}
              />
            </div>

            {renderArrayField(
              'Application Questions',
              'application.questions',
              formData.application.questions,
              'Question {index} for applicants...',
              'blue'
            )}
          </div>

          {/* Job Features */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span>Job Features</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="group flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-100 rounded-xl border border-purple-200 hover:border-purple-600 transition-all duration-300 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-600 transition-all duration-300"
                  />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span>Feature this job</span>
                  </span>
                  <p className="text-sm text-gray-600 mt-1">Get extra visibility in search results</p>
                </div>
                <Rocket className="h-5 w-5 text-purple-600 transform group-hover:scale-110 transition-transform duration-300" />
              </label>

              <label className="group flex items-center space-x-3 p-4 bg-gradient-to-r from-red-50 to-orange-100 rounded-xl border border-orange-200 hover:border-orange-600 transition-all duration-300 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.urgent}
                    onChange={(e) => handleInputChange('urgent', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-600 transition-all duration-300"
                  />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-orange-600" />
                    <span>Urgent hiring</span>
                  </span>
                  <p className="text-sm text-gray-600 mt-1">Highlight that you're hiring immediately</p>
                </div>
                <TrendingUp className="h-5 w-5 text-orange-600 transform group-hover:scale-110 transition-transform duration-300" />
              </label>
            </div>
          </div>

          {/* Status */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <span>Job Status</span>
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {renderStatusOptions()}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/employer/all-applications')}
              className="group flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:border-green-600 hover:text-green-600 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Cancel</span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="group flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-auto"
            >
              <Save className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="font-medium">{saving ? 'Saving Changes...' : 'Update Job'}</span>
              <Rocket className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>

        {/* Quick Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200/50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-900 mb-3">Optimization Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-blue-800 font-medium">Clear Job Titles</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl backdrop-blur-sm">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <span className="text-blue-800 font-medium">Specific Skills</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl backdrop-blur-sm">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Detailed Description</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditJob;