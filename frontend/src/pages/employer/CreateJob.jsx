import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { jobsAPI } from '../../api/apiClient.js';
import { 
  Save, ArrowLeft, Briefcase, MapPin, DollarSign, Clock, 
  FileText, CheckCircle, Users, Award, Plus, X, Zap,
  Building, Target, Star, TrendingUp, Shield, Globe,
  Lightbulb, Heart, Rocket, Sparkles
} from 'lucide-react';
import { showToast } from '../../utils/toast.js';

// Reusable Form Components
const InputField = ({ label, type = "text", value, onChange, placeholder, required = false, className = "" }) => (
  <div className={className}>
    <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center space-x-1">
      <span>{label}</span>
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400"
      placeholder={placeholder}
      required={required}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, required = false, className = "" }) => (
  <div className={className}>
    <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center space-x-1">
      <span>{label}</span>
      {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400"
      required={required}
    >
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

// Main Component
const CreateJob = () => {
  // Hooks and State
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    company: user?.company || '',
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
    saRequirements: {
      bbBee: false,
      saCitizen: false,
      driversLicense: false,
      clearCriminalRecord: false,
      languageRequirements: ['']
    },
    application: {
      deadline: '',
      instructions: '',
      questions: ['']
    },
    featured: false,
    urgent: false
  });

  // Constants
  const provinces = ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape', 'Remote'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Freelance'];
  const categories = ['Information Technology', 'Finance', 'Healthcare', 'Engineering', 'Education', 'Sales & Marketing', 'Hospitality', 'Construction', 'Manufacturing', 'Government', 'Design', 'Other'];
  const experienceLevels = ['Entry', 'Mid', 'Senior', 'Executive'];

  const steps = [
    { number: 1, title: 'Basic Info', icon: Briefcase },
    { number: 2, title: 'Salary & Details', icon: DollarSign },
    { number: 3, title: 'Description', icon: FileText },
    { number: 4, title: 'Final Touches', icon: CheckCircle }
  ];

  // Event Handlers
  const handleInputChange = React.useCallback((path, value) => {
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
  }, []);

  const handleArrayChange = React.useCallback((path, index, value) => {
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
  }, []);

  const addArrayItem = React.useCallback((path) => {
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
  }, []);

  const removeArrayItem = React.useCallback((path, index) => {
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
  }, []);

  // Navigation Functions
  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter' && currentStep < steps.length) {
      e.preventDefault();
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    nextStep();
  };

  // Form Submission
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (currentStep !== steps.length) {
    console.log('Prevented submission: not on final step');
    return;
  }

  setLoading(true);

  try {
    const submitData = {
      title: formData.title,
      company: formData.company,
      'location.province': formData.location.province,
      'location.city': formData.location.city,
      type: formData.type,
      category: formData.category,
      'salary.min': formData.salary.min ? parseInt(formData.salary.min) : undefined,
      'salary.max': formData.salary.max ? parseInt(formData.salary.max) : undefined,
      'salary.currency': formData.salary.currency,
      'salary.period': formData.salary.period,
      'salary.isNegotiable': formData.salary.isNegotiable,
      description: formData.description,
      // Handle arrays
      requirements: formData.requirements.filter(req => req.trim() !== ''),
      skills: formData.skills.filter(skill => skill.trim() !== ''),
      benefits: formData.benefits.filter(benefit => benefit.trim() !== ''),
      experienceLevel: formData.experienceLevel,
      'saRequirements.bbBee': formData.saRequirements.bbBee,
      'saRequirements.saCitizen': formData.saRequirements.saCitizen,
      'saRequirements.driversLicense': formData.saRequirements.driversLicense,
      'saRequirements.clearCriminalRecord': formData.saRequirements.clearCriminalRecord,
      'saRequirements.languageRequirements': formData.saRequirements.languageRequirements.filter(lang => lang.trim() !== ''),
      'application.deadline': formData.application.deadline,
      'application.instructions': formData.application.instructions,
      'application.questions': formData.application.questions.filter(question => question.trim() !== ''),
      featured: formData.featured,
      urgent: formData.urgent
    };

    console.log('Submitting job data:', submitData);
    await jobsAPI.createJob(submitData);
    showToast('🎉 Job posted successfully!', 'success');
    navigate('/employer/dashboard');
  } catch (error) {
    console.error('Error creating job:', error);
    
    // Error logging
    if (error.response?.data?.errors) {
      console.log('Validation errors:', error.response.data.errors);
      const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
      showToast(`Validation failed: ${errorMessages}`, 'error');
    } else {
      showToast(error.response?.data?.message || 'Failed to create job', 'error');
    }
  } finally {
    setLoading(false);
  }
};

  // Render Functions
  const renderStepIndicator = () => {
    return steps.map((step, index) => {
      const StepIcon = step.icon;
      const isCompleted = step.number < currentStep;
      const isCurrent = step.number === currentStep;
      
      return (
        <div key={step.number} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 transform ${
              isCompleted 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 scale-110 shadow-lg' 
                : isCurrent 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 scale-110 shadow-lg ring-2 ring-blue-500/20' 
                : 'bg-gray-200'
            }`}>
              <StepIcon className={`h-6 w-6 ${
                isCompleted || isCurrent ? 'text-white' : 'text-gray-400'
              }`} />
              {isCompleted && (
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <span className={`text-sm font-medium mt-2 ${
              isCompleted ? 'text-green-600' : 
              isCurrent ? 'text-blue-600' : 
              'text-gray-400'
            }`}>
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
              step.number < currentStep 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : 'bg-gray-200'
            }`} />
          )}
        </div>
      );
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="card p-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <Briefcase className="h-6 w-6 text-white" />
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
                />
              </div>
              
              <SelectField
                label="Job Type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                options={jobTypes}
                required
              />
              
              <SelectField
                label="Category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                options={categories}
                required
              />
              
              <SelectField
                label="Province"
                value={formData.location.province}
                onChange={(e) => handleInputChange('location.province', e.target.value)}
                options={['', ...provinces]}
                required
              />
              
              <InputField
                label="City"
                value={formData.location.city}
                onChange={(e) => handleInputChange('location.city', e.target.value)}
                placeholder="e.g., Johannesburg"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="card p-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <span>Salary & Compensation</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Minimum Salary (ZAR)"
                type="number"
                value={formData.salary.min}
                onChange={(e) => handleInputChange('salary.min', e.target.value)}
                placeholder="e.g., 40000"
              />
              
              <InputField
                label="Maximum Salary (ZAR)"
                type="number"
                value={formData.salary.max}
                onChange={(e) => handleInputChange('salary.max', e.target.value)}
                placeholder="e.g., 60000"
              />
              
              <SelectField
                label="Salary Period"
                value={formData.salary.period}
                onChange={(e) => handleInputChange('salary.period', e.target.value)}
                options={['monthly', 'annually']}
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
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900">Salary is negotiable</span>
                    <p className="text-sm text-gray-600 mt-1">Show candidates that you're open to discussion</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600 transform group-hover:scale-110 transition-transform duration-300" />
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="card p-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span>Job Description & Requirements</span>
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                  <span>Job Description</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 resize-none"
                  placeholder="Describe the role, responsibilities, company culture, and what makes this opportunity special..."
                  required
                />
              </div>
              
              {/* Requirements */}
              <div>
                <label className="flex text-sm font-semibold text-gray-700 mb-3 items-center space-x-2">
                  <Target className="h-4 w-4 text-red-500" />
                  <span>Requirements</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {formData.requirements.map((requirement, index) => (
                    <div key={`requirement-${index}`} className="flex items-center space-x-3 group">
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400"
                        placeholder={`Requirement ${index + 1} (e.g., 3+ years of experience...)`}
                      />
                      {formData.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('requirements', index)}
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
                  onClick={() => addArrayItem('requirements')}
                  className="mt-3 flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Add Requirement</span>
                </button>
              </div>

              {/* Skills */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Skills</span>
                </label>
                <div className="space-y-3">
                  {formData.skills.map((skill, index) => (
                    <div key={`skill-${index}`} className="flex items-center space-x-3 group">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400"
                        placeholder={`Skill ${index + 1} (e.g., React, Node.js...)`}
                      />
                      {formData.skills.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('skills', index)}
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
                  onClick={() => addArrayItem('skills')}
                  className="mt-3 flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-600 rounded-xl hover:bg-yellow-200 transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Add Skill</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="card p-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span>Final Touches</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Experience Level"
                value={formData.experienceLevel}
                onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                options={experienceLevels}
              />
              
              <InputField
                label="Application Deadline"
                type="date"
                value={formData.application.deadline}
                onChange={(e) => handleInputChange('application.deadline', e.target.value)}
              />
              
              <div className="md:col-span-2 space-y-4">
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
                      <Star className="h-4 w-4 text-purple-600" />
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/employer/dashboard')}
              className="group flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-all duration-300 transform hover:-translate-x-1"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
          <div className="text-center lg:text-right">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Create New Job
            </h1>
            <p className="text-gray-600 text-lg mt-2">Attract top talent with an amazing job posting</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="card p-6 mb-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-2xl">
          <div className="flex justify-between items-center">
            {renderStepIndicator()}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="group flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:border-green-600 hover:text-green-600 transition-all duration-300 transform hover:-translate-x-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Previous</span>
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="group flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <span>Next Step</span>
                <ArrowLeft className="h-4 w-4 transform rotate-180 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="group flex items-center space-x-2 btn-primary text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Save className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span>{loading ? 'Posting Job...' : 'Publish Job'}</span>
                <Rocket className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;