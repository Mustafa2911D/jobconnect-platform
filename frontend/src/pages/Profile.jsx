import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userAPI } from '../api/apiClient.js';
import { 
  User, MapPin, Briefcase, Award, BookOpen, Settings, Camera, Save,
  Edit3, CheckCircle, X, Star, Zap, TrendingUp, Shield, Mail,
  Phone, Globe, Flag, Crown, Sparkles, Lightbulb, ArrowRight,
  Upload, Eye, EyeOff, Lock, Unlock, BadgeCheck, Calendar
} from 'lucide-react';
import getImageUrl from '../utils/imageUrl';

const Profile = () => {
  const { user, updateUser, refreshUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    province: '',
    headline: '',
    bio: '',
    citizenship: '',
    bbBee: ''
  });
  const [profileStrength, setProfileStrength] = useState(0);
  const [strengthBreakdown, setStrengthBreakdown] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Constants
  const provinces = [
    'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 
    'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape'
  ];

  const navigationItems = [
    { key: 'overview', label: 'Profile Overview', icon: User, active: true },
    { key: 'experience', label: 'Work Experience', icon: Briefcase, href: '/experience' },
    { key: 'education', label: 'Education', icon: Award, href: '/education' },
    { key: 'skills', label: 'Skills & Expertise', icon: BookOpen, href: '/skills' },
    { key: 'settings', label: 'Account Settings', icon: Settings, href: '/settings' },
  ];

  const strengthItems = [
    { key: 'hasHeadline', label: 'Professional Headline', completed: strengthBreakdown.hasHeadline },
    { key: 'hasBio', label: 'Professional Bio', completed: strengthBreakdown.hasBio },
    { key: 'hasLocation', label: 'Location', completed: strengthBreakdown.hasLocation },
    { key: 'hasPhone', label: 'Phone Number', completed: strengthBreakdown.hasPhone },
    { key: 'hasSkills', label: 'Skills', completed: strengthBreakdown.hasSkills },
    { key: 'hasExperience', label: 'Experience', completed: strengthBreakdown.hasExperience },
    { key: 'hasEducation', label: 'Education', completed: strengthBreakdown.hasEducation },
  ];

  // Effects
  useEffect(() => {
    fetchProfile();
  }, []);

  // API Functions
  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = response.data.user;
      setProfile(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.profile?.contact?.phone || '',
        province: userData.profile?.location?.province || '',
        headline: userData.profile?.headline || '',
        bio: userData.profile?.bio || '',
        citizenship: userData.saIdentity?.citizenship || '',
        bbBee: userData.saIdentity?.bbBee || ''
      });
      
      fetchProfileStrength();
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast('Error loading profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileStrength = async () => {
    try {
      const response = await userAPI.getProfileStrength();
      setProfileStrength(response.data.profileCompletion);
      setStrengthBreakdown(response.data.breakdown || {});
    } catch (error) {
      console.error('Error fetching profile strength:', error);
      calculateLocalProfileStrength();
    }
  };

  // Utility Functions
  const calculateLocalProfileStrength = () => {
    if (!profile) return;
    
    let score = 0;
    const breakdown = {
      hasName: !!profile.name,
      hasEmail: !!profile.email,
      hasHeadline: !!profile.profile?.headline,
      hasBio: !!profile.profile?.bio,
      hasLocation: !!profile.profile?.location?.province,
      hasPhone: !!profile.profile?.contact?.phone,
      hasSkills: profile.skills?.length > 0,
      hasExperience: profile.experience?.length > 0,
      hasEducation: profile.education?.length > 0,
      hasAvatar: !!profile.profile?.avatar
    };

    if (breakdown.hasName) score += 10;
    if (breakdown.hasEmail) score += 10;
    if (breakdown.hasHeadline) score += 15;
    if (breakdown.hasBio) score += 10;
    if (breakdown.hasLocation) score += 10;
    if (breakdown.hasPhone) score += 10;
    if (breakdown.hasSkills) score += 15;
    if (breakdown.hasExperience) score += 10;
    if (breakdown.hasEducation) score += 10;
    
    setProfileStrength(Math.min(score, 100));
    setStrengthBreakdown(breakdown);
  };

  const getStrengthColor = (strength) => {
    if (strength >= 80) return 'from-green-500 to-emerald-600';
    if (strength >= 60) return 'from-yellow-500 to-amber-600';
    if (strength >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-rose-600';
  };

  const getStrengthIcon = (strength) => {
    if (strength >= 80) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (strength >= 60) return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (strength >= 40) return <Star className="h-5 w-5 text-yellow-500" />;
    return <Zap className="h-5 w-5 text-orange-500" />;
  };

  const showToast = (message, type = 'success') => {
    const existingToasts = document.querySelectorAll('.custom-toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `custom-toast fixed top-4 right-4 ${
      type === 'success' ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-rose-600'
    } text-white px-6 py-4 rounded-2xl shadow-2xl z-50 transform transition-all duration-500 translate-x-0 flex items-center space-x-3`;
    
    toast.innerHTML = `
      ${type === 'success' ? 
        '<div class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"><CheckCircle class="h-4 w-4 text-white" /></div>' :
        '<div class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"><X class="h-4 w-4 text-white" /></div>'
      }
      <span class="font-semibold">${message}</span>
    `;
    
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 500);
    }, 4000);
  };

  // Event Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be smaller than 5MB', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    setUploading(true);
    try {
      const response = await userAPI.uploadAvatar(formData);
      
      if (response.data.success) {
        // Update the user in context and local state
        updateUser(response.data.user);
        setProfile(response.data.user);
        
        showToast('Profile image updated successfully! 🎉');
        
        // Refresh the entire user profile to ensure consistency
        await refreshUserProfile();
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      const errorMessage = error.response?.data?.message || 'Error uploading image';
      showToast(errorMessage, 'error');
    } finally {
      setUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updateData = {
        name: formData.name,
        profile: {
          headline: formData.headline,
          bio: formData.bio,
          location: {
            province: formData.province
          },
          contact: {
            phone: formData.phone
          }
        }
      };

      if (formData.citizenship || formData.bbBee) {
        updateData.saIdentity = {
          citizenship: formData.citizenship,
          bbBee: formData.bbBee
        };
      }

      console.log('Sending update data:', updateData);
      
      const response = await userAPI.updateProfile(updateData);
      
      if (response.data.success) {
        setProfile(response.data.user);
        updateUser(response.data.user);
        setIsEditing(false);
        showToast('Profile updated successfully! 🎉');
        
        fetchProfileStrength();
        fetchProfile();
      }
    } catch (error) {
      console.error('Full error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Error updating profile';
      
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map(err => 
          `${err.field || ''}: ${err.message}`
        ).join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-green-600 to-blue-800 bg-clip-text text-transparent">
            My Professional Profile
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Build your professional identity and stand out to South African employers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="card p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
                    {getImageUrl(user?.profileImage || user?.profile?.avatar) ? (
                      <img 
                        src={getImageUrl(user?.profileImage || user?.profile?.avatar)} 
                        alt="Profile" 
                        className="w-full h-full rounded-2xl object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full rounded-2xl flex items-center justify-center ${getImageUrl(user?.profileImage || user?.profile?.avatar) ? 'hidden' : 'flex'}`}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-all duration-300 transform hover:scale-110 cursor-pointer shadow-md"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                  {profileStrength >= 80 && (
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <BadgeCheck className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.name}</h2>
                <p className="text-gray-600 capitalize mb-2">{user?.role}</p>
                <div className="flex items-center justify-center space-x-1 text-sm text-gray-500 mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>{profile?.profile?.location?.province || 'South Africa'}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getStrengthColor(profileStrength)} text-white flex items-center space-x-1`}>
                    {getStrengthIcon(profileStrength)}
                    <span>Profile Strength</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  item.href ? (
                    <Link
                      key={item.key}
                      to={item.href}
                      className="group flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-green-600/10 hover:to-blue-800/10 hover:text-green-600 hover:shadow-md"
                    >
                      <item.icon className="h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors" />
                      <span className="font-medium text-gray-700 group-hover:text-green-600 transition-colors">{item.label}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 ml-auto transition-all duration-300 group-hover:translate-x-1" />
                    </Link>
                  ) : (
                    <button
                      key={item.key}
                      onClick={() => setActiveSection(item.key)}
                      className={`w-full group flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-300 ${
                        activeSection === item.key
                          ? 'bg-gradient-to-r from-green-600 to-blue-800 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-600/10 hover:to-blue-800/10 hover:text-green-600 hover:shadow-md'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 transition-colors ${
                        activeSection === item.key ? 'text-white' : 'text-gray-600 group-hover:text-green-600'
                      }`} />
                      <span className={`font-medium transition-colors ${
                        activeSection === item.key ? 'text-white' : 'text-gray-700 group-hover:text-green-600'
                      }`}>{item.label}</span>
                      {activeSection === item.key && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </button>
                  )
                ))}
              </nav>
            </div>

            {/* Profile Strength Card */}
            <div className="card p-6 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Profile Completion</span>
              </h3>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-gray-900">{profileStrength}%</span>
                  {profileStrength >= 80 ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm font-semibold">Excellent!</span>
                    </div>
                  ) : profileStrength >= 60 ? (
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">Good Progress</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-orange-600">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm font-semibold">Keep Going</span>
                    </div>
                  )}
                </div>
                
                <div className="w-full bg-white/80 rounded-full h-3 shadow-inner overflow-hidden">
                  <div 
                    className={`h-3 rounded-full bg-gradient-to-r ${getStrengthColor(profileStrength)} transition-all duration-1000 ease-out shadow-md`}
                    style={{ width: `${profileStrength}%` }}
                  ></div>
                </div>
              </div>

              {/* Strength Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Complete these to improve:</h4>
                {strengthItems.map((item) => !item.completed && (
                  <div key={item.key} className="flex items-center space-x-3 p-2 bg-white/50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700 flex-1">{item.label}</span>
                    <Lightbulb className="h-4 w-4 text-orange-500" />
                  </div>
                ))}
                
                {Object.values(strengthBreakdown).filter(v => !v).length === 0 && (
                  <div className="flex items-center space-x-2 p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-800">All profile sections complete! 🎉</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {activeSection === 'overview' && (
              <>
                {/* Personal Information Card */}
                <div className="card p-8 hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h3>
                      <p className="text-gray-600">Update your basic information and professional details</p>
                    </div>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`mt-4 lg:mt-0 flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                        isEditing 
                          ? 'bg-gradient-to-r from-gray-600 to-gray-800 text-white hover:from-gray-700 hover:to-gray-900' 
                          : 'bg-gradient-to-r from-green-600 to-blue-800 text-white hover:from-blue-800 hover:to-green-600'
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <X className="h-4 w-4" />
                          <span>Cancel Editing</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4" />
                          <span>Edit Profile</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Basic Information */}
                    <div className="space-y-6">
                      <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                          <User className="h-4 w-4 text-green-600" />
                          <span>Full Name</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-50/50 transition-all duration-300 group-hover:border-gray-300"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span>Email Address</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="input-field disabled:bg-gray-50/50 bg-blue-50/30 border-blue-200"
                        />
                      </div>

                      <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-purple-600" />
                          <span>Phone Number</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-50/50 transition-all duration-300 group-hover:border-gray-300"
                          placeholder="+27 XXX XXX XXXX"
                        />
                      </div>

                      <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-red-600" />
                          <span>Province</span>
                        </label>
                        <select
                          name="province"
                          value={formData.province}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-50/50 transition-all duration-300 group-hover:border-gray-300"
                        >
                          <option value="">Select your province</option>
                          {provinces.map(province => (
                            <option key={province} value={province}>{province}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="space-y-6">
                      <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-orange-600" />
                          <span>Professional Headline</span>
                        </label>
                        <input
                          type="text"
                          name="headline"
                          value={formData.headline}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-50/50 transition-all duration-300 group-hover:border-gray-300"
                          placeholder="e.g., Senior Software Developer"
                        />
                      </div>

                      <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-green-600" />
                          <span>Professional Bio</span>
                        </label>
                        <textarea
                          rows={5}
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-50/50 transition-all duration-300 group-hover:border-gray-300 resize-none"
                          placeholder="Describe your professional background, skills, and career aspirations..."
                        />
                        <div className="text-xs text-gray-500 mt-2">
                          {formData.bio.length}/500 characters
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* South African Information */}
                  {user?.role === 'candidate' && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                        <Flag className="h-5 w-5 text-green-600" />
                        <span>South African Information</span>
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">Citizenship Status</label>
                          <select
                            name="citizenship"
                            value={formData.citizenship}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="input-field disabled:bg-gray-50/50 transition-all duration-300 group-hover:border-gray-300"
                          >
                            <option value="">Select citizenship status</option>
                            <option value="South African">South African Citizen</option>
                            <option value="Permanent Resident">Permanent Resident</option>
                            <option value="Work Visa">Valid Work Visa</option>
                            <option value="Student Visa">Student Visa</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">B-BBEE Status</label>
                          <select
                            name="bbBee"
                            value={formData.bbBee}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="input-field disabled:bg-gray-50/50 transition-all duration-300 group-hover:border-gray-300"
                          >
                            <option value="">Select B-BBEE status</option>
                            <option value="Yes">Yes - B-BBEE Candidate</option>
                            <option value="No">No</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Actions */}
                  {isEditing && (
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-8 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          fetchProfile();
                        }}
                        className="px-8 py-3 border-2 border-gray-300 text-gray-700 hover:border-gray-400 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                      >
                        Discard Changes
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <Save className="h-5 w-5" />
                        )}
                        <span>{saving ? 'Saving Changes...' : 'Save Profile'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Stats Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card p-6 text-center bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">24</div>
                    <div className="text-sm text-gray-600">Profile Views</div>
                  </div>
                  
                  <div className="card p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">8</div>
                    <div className="text-sm text-gray-600">Applications</div>
                  </div>
                  
                  <div className="card p-6 text-center bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Star className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">95%</div>
                    <div className="text-sm text-gray-600">Profile Strength</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;