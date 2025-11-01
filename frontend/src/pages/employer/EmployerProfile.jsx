import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { employerAPI } from '../../api/apiClient.js';
import { 
  Building, MapPin, Globe, Users, Phone, Mail, Upload, 
  Save, Eye, TrendingUp, Award, Shield, Settings,
  Briefcase, CheckCircle, Clock, Star, Plus, X,
  Sparkles, Target, Heart, Zap, Rocket, ArrowUpRight,
  Camera, Edit3, Users2, TrendingDown, Trash2, ArrowRight
} from 'lucide-react';
import { showToast } from '../../utils/toast.js';

// Constants
const industries = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
  'Retail', 'Hospitality', 'Construction', 'Government', 'Other'
];

const companySizes = [
  '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
];

const benefitOptions = [
  { name: 'Health Insurance', icon: Shield, color: 'green' },
  { name: 'Dental Insurance', icon: Heart, color: 'pink' },
  { name: 'Vision Insurance', icon: Eye, color: 'blue' },
  { name: 'Retirement Plan', icon: Target, color: 'purple' },
  { name: 'Flexible Work Hours', icon: Clock, color: 'orange' },
  { name: 'Remote Work Options', icon: Globe, color: 'indigo' },
  { name: 'Professional Development', icon: TrendingUp, color: 'yellow' },
  { name: 'Stock Options', icon: TrendingUp, color: 'green' },
  { name: 'Bonus System', icon: Award, color: 'blue' },
  { name: 'Paid Time Off', icon: Briefcase, color: 'red' },
  { name: 'Parental Leave', icon: Users2, color: 'pink' },
  { name: 'Wellness Program', icon: Heart, color: 'green' },
  { name: 'Gym Membership', icon: Zap, color: 'orange' },
  { name: 'Free Lunch', icon: Sparkles, color: 'yellow' },
  { name: 'Company Events', icon: Users, color: 'purple' }
];

// Helper Functions
const getColorClasses = (color) => {
  const colors = {
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600',
    purple: 'from-purple-500 to-indigo-600',
    orange: 'from-orange-500 to-red-600',
    yellow: 'from-yellow-500 to-orange-500',
    red: 'from-red-500 to-pink-600',
    pink: 'from-pink-500 to-rose-600',
    indigo: 'from-indigo-500 to-purple-600'
  };
  return colors[color] || colors.green;
};

// Main Component
const EmployerProfile = () => {
  // Hooks and State
  const { user, logout, updateUser, refreshUserProfile } = useAuth();
  
  const [company, setCompany] = useState({
    name: user?.company || '',
    logo: '',
    website: '',
    industry: '',
    size: '',
    founded: '',
    description: '',
    mission: '',
    culture: '',
    benefits: [],
    contact: {
      email: '',
      phone: '',
      address: ''
    },
    social: {
      linkedin: '',
      twitter: '',
      facebook: ''
    }
  });
  
  const [stats, setStats] = useState({
    totalJobs: 0,
    successfulHires: 0,
    responseRate: 0,
    candidateSatisfaction: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hoveredStat, setHoveredStat] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  // Effects
  useEffect(() => {
    fetchCompanyData();
  }, []);

  // Helper Functions
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return null;
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('uploads/')) {
      return `http://localhost:5000/${imagePath}`;
    }
    
    return `http://localhost:5000/uploads/profile-images/${imagePath}`;
  };

  // API Functions
  const fetchCompanyData = async () => {
    try {
      const [profileResponse, statsResponse] = await Promise.all([
        employerAPI.getProfile(),
        employerAPI.getStats()
      ]);
      
      const profile = profileResponse.data.profile;
      const statsData = statsResponse.data.stats || {};
      
      setCompany(prev => ({
        ...prev,
        ...profile.companyProfile,
        name: profile.company || prev.name
      }));

      setStats({
        totalJobs: statsData.totalJobs || 0,
        successfulHires: statsData.successfulHires || 0,
        responseRate: statsData.responseRate || 0,
        candidateSatisfaction: statsData.candidateSatisfaction || 0
      });
    } catch (error) {
      console.error('Error fetching company data:', error);
      showToast('Error loading company profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updateData = {
        companyProfile: {
          name: company.name,
          industry: company.industry,
          size: company.size,
          founded: company.founded,
          website: company.website,
          description: company.description,
          mission: company.mission,
          culture: company.culture,
          benefits: company.benefits,
          contact: company.contact
        }
      };

      console.log('Sending company update:', updateData);
      
      const response = await employerAPI.updateCompanyProfile(updateData);
      
      if (response.data.success) {
        showToast('🎉 Company profile updated successfully!', 'success');
        setIsEditing(false);
        fetchCompanyData();
      } else {
        throw new Error(response.data.message || 'Failed to update company profile');
      }
    } catch (error) {
      console.error('Error updating company profile:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error updating company profile';
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be smaller than 5MB', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    setUploading(true);
    try {
      const response = await employerAPI.uploadProfileImage(formData);
      
      if (response.data.success) {
        updateUser(response.data.user);
        showToast('Company logo updated successfully! 🎉');
        await refreshUserProfile();
      }
    } catch (error) {
      console.error('Error uploading company logo:', error);
      const errorMessage = error.response?.data?.message || 'Error uploading image';
      showToast(errorMessage, 'error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  // Event Handlers
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleStatHover = (index) => {
    setHoveredStat(index);
  };

  const handleStatLeave = () => {
    setHoveredStat(null);
  };

  const handleBenefitToggle = (benefitName) => {
    if (!isEditing || saving) return;

    if (company.benefits?.includes(benefitName)) {
      setCompany({
        ...company,
        benefits: company.benefits.filter(b => b !== benefitName)
      });
    } else {
      setCompany({
        ...company,
        benefits: [...(company.benefits || []), benefitName]
      });
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading company profile...</p>
          <p className="text-gray-500 text-sm mt-2">Getting everything ready</p>
        </div>
      </div>
    );
  }

  // Render Functions
  const renderStats = () => {
    const statItems = [
      {
        label: 'Jobs Posted',
        value: stats.totalJobs,
        icon: Briefcase,
        color: 'from-green-500 to-emerald-600',
        trend: 'up'
      },
      {
        label: 'Successful Hires',
        value: stats.successfulHires,
        icon: CheckCircle,
        color: 'from-blue-500 to-cyan-600',
        trend: 'up'
      },
      {
        label: 'Response Rate',
        value: `${stats.responseRate}%`,
        icon: Clock,
        color: 'from-purple-500 to-indigo-600',
        trend: stats.responseRate >= 80 ? 'up' : 'down'
      },
      {
        label: 'Candidate Satisfaction',
        value: `${stats.candidateSatisfaction}%`,
        icon: Star,
        color: 'from-orange-500 to-red-600',
        trend: stats.candidateSatisfaction >= 80 ? 'up' : 'down'
      }
    ];

    return statItems.map((stat, index) => (
      <div 
        key={index}
        className="group relative"
        onMouseEnter={() => handleStatHover(index)}
        onMouseLeave={handleStatLeave}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500`}></div>
        <div className={`relative flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 transform ${
          hoveredStat === index ? '-translate-y-1' : ''
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center transform ${
              hoveredStat === index ? 'scale-110 rotate-12' : ''
            } transition-transform duration-300 shadow-lg`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700 block">{stat.label}</span>
              <div className="flex items-center space-x-1">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className="text-xs text-gray-500">Live tracking</span>
              </div>
            </div>
          </div>
          <span className="text-lg font-bold text-gray-900">{stat.value}</span>
        </div>
      </div>
    ));
  };

  const renderQuickActions = () => {
    if (!isEditing) return null;

    return (
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200">
            <Upload className="h-4 w-4" />
            <span>Upload Company Photos</span>
          </button>
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
            <Globe className="h-4 w-4" />
            <span>Add Social Links</span>
          </button>
          <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200">
            <Eye className="h-4 w-4" />
            <span>Preview Public Profile</span>
          </button>
        </div>
      </div>
    );
  };

  const renderBasicInformation = () => {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
            <Building className="h-5 w-5 text-white" />
          </div>
          <span>Basic Information</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
            <input
              type="text"
              value={company.name}
              onChange={(e) => setCompany({...company, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter company name"
              disabled={!isEditing || saving}
            />
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Industry *</label>
            <select
              value={company.industry}
              onChange={(e) => setCompany({...company, industry: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!isEditing || saving}
            >
              <option value="">Select Industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Size</label>
            <select
              value={company.size}
              onChange={(e) => setCompany({...company, size: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!isEditing || saving}
            >
              <option value="">Select Size</option>
              {companySizes.map(size => (
                <option key={size} value={size}>{size} employees</option>
              ))}
            </select>
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Year Founded</label>
            <input
              type="number"
              value={company.founded}
              onChange={(e) => setCompany({...company, founded: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="e.g., 2018"
              disabled={!isEditing || saving}
            />
          </div>
          <div className="md:col-span-2 group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10 transition-colors group-hover:text-green-600" />
              <input
                type="url"
                value={company.website}
                onChange={(e) => setCompany({...company, website: e.target.value})}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="https://company.com"
                disabled={!isEditing || saving}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCompanyStory = () => {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
            <Award className="h-5 w-5 text-white" />
          </div>
          <span>Company Story</span>
        </h3>
        
        <div className="space-y-6">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Description *</label>
            <textarea
              rows={4}
              value={company.description}
              onChange={(e) => setCompany({...company, description: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Describe what your company does, your products/services, and what makes you unique..."
              disabled={!isEditing || saving}
            />
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mission Statement</label>
            <textarea
              rows={3}
              value={company.mission}
              onChange={(e) => setCompany({...company, mission: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="What is your company's mission and core purpose?"
              disabled={!isEditing || saving}
            />
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Culture</label>
            <textarea
              rows={3}
              value={company.culture}
              onChange={(e) => setCompany({...company, culture: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Describe your company culture, values, and work environment..."
              disabled={!isEditing || saving}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderContactInformation = () => {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <span>Contact Information</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10 transition-colors group-hover:text-green-600" />
              <input
                type="email"
                value={company.contact?.email}
                onChange={(e) => setCompany({
                  ...company, 
                  contact: {...company.contact, email: e.target.value}
                })}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="careers@company.com"
                disabled={!isEditing || saving}
              />
            </div>
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10 transition-colors group-hover:text-green-600" />
              <input
                type="tel"
                value={company.contact?.phone}
                onChange={(e) => setCompany({
                  ...company, 
                  contact: {...company.contact, phone: e.target.value}
                })}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="+27 11 123 4567"
                disabled={!isEditing || saving}
              />
            </div>
          </div>
          <div className="md:col-span-2 group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10 transition-colors group-hover:text-green-600" />
              <input
                type="text"
                value={company.contact?.address}
                onChange={(e) => setCompany({
                  ...company, 
                  contact: {...company.contact, address: e.target.value}
                })}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Company physical address"
                disabled={!isEditing || saving}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBenefitsAndPerks = () => {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span>Employee Benefits & Perks</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefitOptions.map((benefit) => {
            const BenefitIcon = benefit.icon;
            const isSelected = company.benefits?.includes(benefit.name);
            
            return (
              <label 
                key={benefit.name} 
                className={`group relative flex items-center space-x-3 p-4 border rounded-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
                  isSelected 
                    ? `border-${benefit.color}-500 bg-${benefit.color}-50 shadow-md` 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                } ${!isEditing ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleBenefitToggle(benefit.name)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-600"
                  disabled={!isEditing || saving}
                />
                <div className={`w-8 h-8 bg-gradient-to-r ${getColorClasses(benefit.color)} rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                  <BenefitIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 flex-1">{benefit.name}</span>
                {isSelected && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCompanyLogo = () => {
    return (
      <div className="text-center mb-6">
        <div className="relative inline-block group">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg transform group-hover:scale-105 transition-transform duration-300 overflow-hidden">
              {getImageUrl(user?.profileImage || user?.companyProfile?.logo) ? (
                <img 
                  src={getImageUrl(user?.profileImage || user?.companyProfile?.logo)} 
                  alt="Company logo" 
                  className="w-full h-full rounded-2xl object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-full h-full rounded-2xl flex items-center justify-center ${getImageUrl(user?.profileImage || user?.companyProfile?.logo) ? 'hidden' : 'flex'}`}
              >
                {company.name?.charAt(0) || 'C'}
              </div>
            </div>
            {isEditing && (
              <label className="absolute bottom-2 right-2 w-8 h-8 bg-gradient-to-r from-green-600 to-blue-800 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 transform hover:scale-110 cursor-pointer shadow-lg">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
              </label>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
          {company.name}
        </h2>
        <p className="text-gray-600 font-medium">{company.industry}</p>
        <div className="flex items-center justify-center space-x-1 text-sm text-gray-500 mt-1">
          <MapPin className="h-4 w-4" />
          <span>{company.contact?.address || 'South Africa'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg blur opacity-25"></div>
              <div className="relative">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Company Profile
                </h1>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={handleEditToggle}
              className="group flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-xl hover:border-green-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 w-full lg:w-auto"
            >
              <Edit3 className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="font-medium">{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !isEditing}
              className="group flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r btn-primary text-white rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full lg:w-auto"
            >
              <Save className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="font-medium">{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        <p className="text-gray-600 text-lg mb-8 text-center lg:text-left max-w-3xl">
          Showcase your company culture and attract the best talent with a compelling employer brand
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 sticky top-24">
              {renderCompanyLogo()}
              
              {/* Stats */}
              <div className="space-y-4 mb-6">
                {renderStats()}
              </div>

              {renderQuickActions()}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {renderBasicInformation()}
              {renderCompanyStory()}
              {renderContactInformation()}
              {renderBenefitsAndPerks()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;