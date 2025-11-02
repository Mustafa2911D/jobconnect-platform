import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userAPI } from '../api/apiClient.js';
import { 
  Plus, Edit, Trash2, Save, Camera, MapPin, Calendar, User, 
  Briefcase, Award, BookOpen, Settings, Rocket, Star, Zap,
  ChevronRight, Building, Clock, Target, TrendingUp, CheckCircle,
  X, ArrowRight, Sparkles, Lightbulb, Crown, Award as AwardIcon
} from 'lucide-react';
import getImageUrl from '../../utils/imageUrl';

const Experience = () => {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const [experiences, setExperiences] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    employmentType: 'full-time',
    industry: ''
  });

  // Constants
  const employmentTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
    { value: 'remote', label: 'Remote' }
  ];

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing',
    'Retail', 'Hospitality', 'Construction', 'Marketing', 'Consulting',
    'Government', 'Non-profit', 'Other'
  ];

  // Effects
  useEffect(() => {
    fetchExperiences();
  }, []);

  // API Functions
  const fetchExperiences = async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = response.data.user;
      setExperiences(userData.experience || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      showToast('Error loading experiences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveExperiences = async (updatedExperiences) => {
    try {
      setSaving(true);
      
      const formattedExperiences = updatedExperiences.map(exp => ({
        title: exp.title,
        company: exp.company,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.current ? null : exp.endDate,
        current: exp.current,
        description: exp.description,
        employmentType: exp.employmentType,
        industry: exp.industry
      }));

      console.log('Sending formatted experiences:', formattedExperiences);
      
      const response = await userAPI.updateProfile({ experience: formattedExperiences });
      
      if (response.data.success) {
        setExperiences(updatedExperiences);
        updateUser(response.data.user);
        showToast('Experience updated successfully! 🎉');
        return true;
      }
    } catch (error) {
      console.error('Error saving experience:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error saving experience';
      showToast(errorMessage, 'error');
      return false;
    } finally {
      setSaving(false);
    }
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

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getEmploymentTypeColor = (type) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      'contract': 'bg-purple-100 text-purple-800',
      'freelance': 'bg-orange-100 text-orange-800',
      'internship': 'bg-yellow-100 text-yellow-800',
      'remote': 'bg-cyan-100 text-cyan-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const calculateDuration = (startDate, endDate, current) => {
    const start = new Date(startDate);
    const end = current ? new Date() : new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) return `${remainingMonths} mos`;
    if (remainingMonths === 0) return `${years} yr${years > 1 ? 's' : ''}`;
    return `${years} yr${years > 1 ? 's' : ''} ${remainingMonths} mos`;
  };

  // Event Handlers
  const handleAdd = () => {
    setIsEditing(true);
    setEditingId(null);
    setFormData({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      employmentType: 'full-time',
      industry: ''
    });
  };

  const handleEdit = (exp) => {
    setIsEditing(true);
    setEditingId(exp._id || exp.id);
    setFormData({
      title: exp.title || '',
      company: exp.company || '',
      location: exp.location || '',
      startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
      endDate: exp.endDate && !exp.current ? new Date(exp.endDate).toISOString().split('T')[0] : '',
      current: exp.current || false,
      description: exp.description || '',
      employmentType: exp.employmentType || 'full-time',
      industry: exp.industry || ''
    });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.company || !formData.startDate) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    let updatedExperiences;
    
    if (editingId) {
      updatedExperiences = experiences.map(exp => 
        (exp._id || exp.id) === editingId 
          ? { 
              ...exp,
              title: formData.title,
              company: formData.company,
              location: formData.location,
              startDate: formData.startDate,
              endDate: formData.current ? null : formData.endDate,
              current: formData.current,
              description: formData.description,
              employmentType: formData.employmentType,
              industry: formData.industry
            }
          : exp
      );
    } else {
      const newExperience = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.current ? null : formData.endDate,
        current: formData.current,
        description: formData.description,
        employmentType: formData.employmentType,
        industry: formData.industry,
        _id: Date.now().toString(),
        id: Date.now().toString()
      };
      updatedExperiences = [...experiences, newExperience];
    }

    const success = await saveExperiences(updatedExperiences);
    
    if (success) {
      setIsEditing(false);
      setEditingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      const updatedExperiences = experiences.filter(exp => (exp._id || exp.id) !== id);
      await saveExperiences(updatedExperiences);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your experience...</p>
        </div>
      </div>
    );
  }

  // Navigation Items
  const navItems = [
    { key: 'profile', label: 'Profile Overview', icon: User, href: '/profile' },
    { key: 'experience', label: 'Work Experience', icon: Briefcase, active: true },
    { key: 'education', label: 'Education', icon: Award, href: '/education' },
    { key: 'skills', label: 'Skills & Expertise', icon: BookOpen, href: '/skills' },
    { key: 'settings', label: 'Account Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-6 space-y-6">
              {/* Profile Card */}
              <div className="card p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center mb-6">
                  <div className="relative inline-block mb-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
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
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-600 text-sm capitalize mb-2">{user?.role}</p>
                  <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span>{user?.profile?.location?.province || 'South Africa'}</span>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    item.href ? (
                      <Link
                        key={item.key}
                        to={item.href}
                        className="group flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-green-600/10 hover:to-blue-800/10 hover:text-green-600 hover:shadow-md"
                      >
                        <item.icon className="h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors" />
                        <span className="font-medium text-gray-700 group-hover:text-green-600 transition-colors">{item.label}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 ml-auto transition-all duration-300 group-hover:translate-x-1" />
                      </Link>
                    ) : (
                      <div
                        key={item.key}
                        className="group flex items-center space-x-3 px-4 py-3 text-left rounded-xl bg-gradient-to-r from-green-600 to-blue-800 text-white shadow-lg"
                      >
                        <item.icon className="h-5 w-5 text-white" />
                        <span className="font-medium">{item.label}</span>
                        <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )
                  ))}
                </nav>
              </div>

              {/* Stats Card */}
              <div className="card p-6 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span>Experience Summary</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Total Positions</span>
                    <span className="font-bold text-orange-600">{experiences.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Current Role</span>
                    <span className="font-bold text-green-600">
                      {experiences.filter(exp => exp.current).length > 0 ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Industries</span>
                    <span className="font-bold text-blue-600">
                      {new Set(experiences.map(exp => exp.industry)).size}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-green-600 to-blue-800 bg-clip-text text-transparent">
                  Work Experience
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl">
                  Showcase your professional journey and build credibility with South African employers
                </p>
              </div>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="mt-4 lg:mt-0 bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Add Experience</span>
              </button>
            </div>

            {/* Edit Form */}
            {isEditing && (
              <div className="card p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                    <Rocket className="h-6 w-6 text-green-600" />
                    <span>{editingId ? 'Edit Experience' : 'Add New Experience'}</span>
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Fields marked with * are required</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="group">
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-green-600" />
                      <span>Job Title *</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input-field transition-all duration-300 group-hover:border-gray-300"
                      placeholder="e.g., Senior Software Developer"
                      disabled={saving}
                    />
                  </div>

                  <div className="group">
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <span>Company *</span>
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="input-field transition-all duration-300 group-hover:border-gray-300"
                      placeholder="e.g., Tech Innovations South Africa"
                      disabled={saving}
                    />
                  </div>

                  <div className="group">
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span>Location</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="input-field transition-all duration-300 group-hover:border-gray-300"
                      placeholder="e.g., Cape Town, Western Cape"
                      disabled={saving}
                    />
                  </div>

                  <div className="group">
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span>Industry</span>
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="input-field transition-all duration-300 group-hover:border-gray-300"
                      disabled={saving}
                    >
                      <option value="">Select Industry</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>

                  <div className="group">
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span>Employment Type</span>
                    </label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                      className="input-field transition-all duration-300 group-hover:border-gray-300"
                      disabled={saving}
                    >
                      {employmentTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="group">
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span>Start Date *</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="input-field transition-all duration-300 group-hover:border-gray-300"
                      disabled={saving}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-200 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.current}
                        onChange={(e) => setFormData({ ...formData, current: e.target.checked, endDate: '' })}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-600 transform scale-110"
                        disabled={saving}
                      />
                      <div>
                        <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                          I currently work here
                        </span>
                        <p className="text-sm text-gray-600">Leave end date empty if this is your current position</p>
                      </div>
                    </label>
                  </div>

                  {!formData.current && (
                    <div className="group">
                      <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-red-600" />
                        <span>End Date *</span>
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="input-field transition-all duration-300 group-hover:border-gray-300"
                        disabled={saving}
                        required={!formData.current}
                      />
                    </div>
                  )}

                  <div className="lg:col-span-2 group">
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                      <span>Description & Achievements</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-field transition-all duration-300 group-hover:border-gray-300 resize-none"
                      placeholder="Describe your responsibilities, key achievements, and skills used in this role..."
                      disabled={saving}
                    />
                    <div className="text-xs text-gray-500 mt-2 flex justify-between">
                      <span>Highlight your accomplishments with bullet points</span>
                      <span>{formData.description.length}/1000 characters</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 hover:border-gray-400 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !formData.title || !formData.company || !formData.startDate || (!formData.current && !formData.endDate)}
                    className="bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    <span>{saving ? 'Saving...' : (editingId ? 'Update Experience' : 'Add Experience')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Experience List */}
            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <div 
                  key={exp._id || exp.id} 
                  className="card p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group border-l-4 border-l-green-500"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                          <Briefcase className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-2">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                              {exp.title}
                            </h3>
                            <div className="flex items-center space-x-2 mt-2 lg:mt-0">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEmploymentTypeColor(exp.employmentType)}`}>
                                {employmentTypes.find(t => t.value === exp.employmentType)?.label || exp.employmentType}
                              </span>
                              {exp.current && (
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                  Current
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-lg text-gray-700 font-semibold mb-3">{exp.company}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{exp.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span className="text-sm">
                                {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {calculateDuration(exp.startDate, exp.endDate, exp.current)}
                              </span>
                            </div>
                            {exp.industry && (
                              <div className="flex items-center space-x-1">
                                <Target className="h-4 w-4" />
                                <span className="text-sm">{exp.industry}</span>
                              </div>
                            )}
                          </div>

                          {exp.description && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{exp.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 lg:pl-4 mt-4 lg:mt-0">
                      <button
                        onClick={() => handleEdit(exp)}
                        disabled={saving}
                        className="p-3 text-blue-600 hover:bg-blue-600/10 rounded-xl transition-all duration-300 transform hover:scale-110 group/edit"
                        title="Edit experience"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp._id || exp.id)}
                        disabled={saving}
                        className="p-3 text-red-600 hover:bg-red-600/10 rounded-xl transition-all duration-300 transform hover:scale-110 group/delete"
                        title="Delete experience"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {experiences.length === 0 && !isEditing && (
                <div className="card p-12 text-center hover:shadow-xl transition-all duration-300">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <Briefcase className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Experience Added Yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto text-lg">
                    Start building your professional profile by adding your work experience. 
                    This helps South African employers understand your career journey.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleAdd}
                      className="bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center space-x-2"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Your First Experience</span>
                    </button>
                    <Link
                      to="/education"
                      className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                    >
                      <AwardIcon className="h-5 w-5" />
                      <span>Add Education Instead</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Tips Section */}
            {experiences.length > 0 && (
              <div className="card p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  <span>Pro Tips for Your Experience</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Use action verbs to describe your achievements</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Include metrics and numbers to show impact</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Highlight skills relevant to your target roles</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Crown className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Keep descriptions concise but impactful</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experience;