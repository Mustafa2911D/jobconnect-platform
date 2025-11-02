import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { userAPI } from '../api/apiClient.js';
import { 
  Plus, Edit, Trash2, Save, Camera, MapPin, Calendar, Award, User, 
  Briefcase, BookOpen, Settings, GraduationCap, Rocket, Star, Zap,
  ChevronRight, Building, Clock, Target, TrendingUp, CheckCircle,
  X, ArrowRight, Sparkles, Lightbulb, Crown, Bookmark, Trophy,
  Medal, FileText, Globe, Users, Shield
} from 'lucide-react';
import getImageUrl from '../utils/imageUrl';

// Constants and Configuration
const qualificationTypes = [
  { value: 'high-school', label: 'High School', icon: Bookmark },
  { value: 'certificate', label: 'Certificate', icon: FileText },
  { value: 'diploma', label: 'Diploma', icon: Medal },
  { value: 'bachelor', label: "Bachelor's Degree", icon: GraduationCap },
  { value: 'honors', label: "Honors Degree", icon: Trophy },
  { value: 'masters', label: "Master's Degree", icon: Award },
  { value: 'phd', label: 'PhD', icon: Shield },
  { value: 'other', label: 'Other', icon: BookOpen }
];

const southAfricanInstitutions = [
  'University of Cape Town',
  'University of the Witwatersrand',
  'Stellenbosch University',
  'University of Pretoria',
  'University of Johannesburg',
  'University of KwaZulu-Natal',
  'North-West University',
  'University of the Western Cape',
  'Rhodes University',
  'University of South Africa',
  'Cape Peninsula University of Technology',
  'Tshwane University of Technology',
  'Durban University of Technology',
  'Vaal University of Technology',
  'Other Institution'
];

const navigationItems = [
  { key: 'profile', label: 'Profile Overview', icon: User, href: '/profile' },
  { key: 'experience', label: 'Work Experience', icon: Briefcase, href: '/experience' },
  { key: 'education', label: 'Education', icon: Award, active: true },
  { key: 'skills', label: 'Skills & Expertise', icon: BookOpen, href: '/skills' },
  { key: 'settings', label: 'Account Settings', icon: Settings, href: '/settings' },
];

const getQualificationColor = (type) => {
  const colors = {
    'high-school': 'bg-blue-100 text-blue-800',
    'certificate': 'bg-green-100 text-green-800',
    'diploma': 'bg-purple-100 text-purple-800',
    'bachelor': 'bg-orange-100 text-orange-800',
    'honors': 'bg-red-100 text-red-800',
    'masters': 'bg-indigo-100 text-indigo-800',
    'phd': 'bg-gray-100 text-gray-800',
    'other': 'bg-yellow-100 text-yellow-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

const getQualificationIcon = (type) => {
  const qual = qualificationTypes.find(q => q.value === type);
  return qual ? qual.icon : BookOpen;
};

const calculateDuration = (startYear, endYear) => {
  const duration = endYear - startYear;
  if (duration === 1) return '1 year';
  if (duration > 1) return `${duration} years`;
  return 'Less than 1 year';
};

// Main Component
const Education = () => {
  // Hooks and State
  const { user, updateUser } = useAuth();
  const location = useLocation();
  
  const [education, setEducation] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    institution: '',
    qualification: '',
    field: '',
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear(),
    completed: true,
    grade: '',
    description: '',
    qualificationType: 'bachelor'
  });

  // Effects
  useEffect(() => {
    fetchEducation();
  }, []);

  // API Functions
  const fetchEducation = async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = response.data.user;
      setEducation(userData.education || []);
    } catch (error) {
      console.error('Error fetching education:', error);
      showToast('Error loading education', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveEducation = async (updatedEducation) => {
    try {
      setSaving(true);
      const response = await userAPI.updateProfile({ education: updatedEducation });
      
      if (response.data.success) {
        setEducation(updatedEducation);
        updateUser(response.data.user);
        showToast('Education updated successfully! 🎓');
        return true;
      }
    } catch (error) {
      console.error('Error saving education:', error);
      const errorMessage = error.response?.data?.message || 'Error saving education';
      showToast(errorMessage, 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Toast Function
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
  const handleAdd = () => {
    setIsEditing(true);
    setEditingId(null);
    setFormData({
      institution: '',
      qualification: '',
      field: '',
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear(),
      completed: true,
      grade: '',
      description: '',
      qualificationType: 'bachelor'
    });
  };

  const handleEdit = (edu) => {
    setIsEditing(true);
    setEditingId(edu._id || edu.id);
    setFormData({
      institution: edu.institution || '',
      qualification: edu.qualification || '',
      field: edu.field || '',
      startYear: edu.startYear || new Date().getFullYear(),
      endYear: edu.endYear || new Date().getFullYear(),
      completed: edu.completed !== undefined ? edu.completed : true,
      grade: edu.grade || '',
      description: edu.description || '',
      qualificationType: edu.qualificationType || 'bachelor'
    });
  };

  const handleSave = async () => {
    if (!formData.institution || !formData.qualification) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    let updatedEducation;
    
    if (editingId) {
      updatedEducation = education.map(edu => 
        (edu._id || edu.id) === editingId 
          ? { 
              ...edu,
              institution: formData.institution,
              qualification: formData.qualification,
              field: formData.field,
              startYear: formData.startYear,
              endYear: formData.endYear,
              completed: formData.completed,
              grade: formData.grade,
              description: formData.description,
              qualificationType: formData.qualificationType
            }
          : edu
      );
    } else {
      const newEducation = {
        institution: formData.institution,
        qualification: formData.qualification,
        field: formData.field,
        startYear: formData.startYear,
        endYear: formData.endYear,
        completed: formData.completed,
        grade: formData.grade,
        description: formData.description,
        qualificationType: formData.qualificationType,
        _id: Date.now().toString(),
        id: Date.now().toString()
      };
      updatedEducation = [...education, newEducation];
    }

    const success = await saveEducation(updatedEducation);
    
    if (success) {
      setIsEditing(false);
      setEditingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this education entry?')) {
      const updatedEducation = education.filter(edu => (edu._id || edu.id) !== id);
      await saveEducation(updatedEducation);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your education...</p>
        </div>
      </div>
    );
  }

  // Render Functions
  const renderSidebar = () => {
    const highestQualification = education.length > 0 ? 
      qualificationTypes.find(q => q.value === education.reduce((highest, curr) => 
        qualificationTypes.findIndex(q => q.value === curr.qualificationType) > 
        qualificationTypes.findIndex(q => q.value === highest.qualificationType) ? curr : highest
      ).qualificationType)?.label || 'Unknown' : 'None';

    return (
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

          {/* Education Stats */}
          <div className="card p-6 bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span>Education Summary</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Total Qualifications</span>
                <span className="font-bold text-purple-600">{education.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Highest Qualification</span>
                <span className="font-bold text-green-600">{highestQualification}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">In Progress</span>
                <span className="font-bold text-orange-600">
                  {education.filter(edu => !edu.completed).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-green-600 to-blue-800 bg-clip-text text-transparent">
            Education & Qualifications
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            Showcase your academic achievements and qualifications to South African employers
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={saving}
          className="mt-4 lg:mt-0 bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Add Education</span>
        </button>
      </div>
    );
  };

  const renderEditingForm = () => {
    if (!isEditing) return null;

    return (
      <div className="card p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <GraduationCap className="h-6 w-6 text-green-600" />
            <span>{editingId ? 'Edit Education' : 'Add New Education'}</span>
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Fields marked with * are required</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Qualification Type */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Qualification Type *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {qualificationTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <label
                    key={type.value}
                    className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                      formData.qualificationType === type.value
                        ? 'border-green-600 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-400 hover:bg-green-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="qualificationType"
                      value={type.value}
                      checked={formData.qualificationType === type.value}
                      onChange={(e) => handleFormChange('qualificationType', e.target.value)}
                      className="absolute opacity-0"
                      disabled={saving}
                    />
                    <IconComponent className={`h-6 w-6 mb-2 ${
                      formData.qualificationType === type.value ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium text-center ${
                      formData.qualificationType === type.value ? 'text-green-600' : 'text-gray-700'
                    }`}>
                      {type.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="group">
            <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <Building className="h-4 w-4 text-blue-600" />
              <span>Institution *</span>
            </label>
            <select
              value={formData.institution}
              onChange={(e) => handleFormChange('institution', e.target.value)}
              className="input-field transition-all duration-300 group-hover:border-gray-300"
              disabled={saving}
            >
              <option value="">Select Institution</option>
              {southAfricanInstitutions.map(institution => (
                <option key={institution} value={institution}>{institution}</option>
              ))}
            </select>
          </div>

          <div className="group">
            <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <Award className="h-4 w-4 text-orange-600" />
              <span>Qualification *</span>
            </label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => handleFormChange('qualification', e.target.value)}
              className="input-field transition-all duration-300 group-hover:border-gray-300"
              placeholder="e.g., BSc Computer Science"
              disabled={saving}
            />
          </div>

          <div className="group">
            <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <span>Field of Study</span>
            </label>
            <input
              type="text"
              value={formData.field}
              onChange={(e) => handleFormChange('field', e.target.value)}
              className="input-field transition-all duration-300 group-hover:border-gray-300"
              placeholder="e.g., Computer Science"
              disabled={saving}
            />
          </div>

          <div className="group">
            <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <span>Start Year *</span>
            </label>
            <input
              type="number"
              value={formData.startYear}
              onChange={(e) => handleFormChange('startYear', parseInt(e.target.value) || new Date().getFullYear())}
              className="input-field transition-all duration-300 group-hover:border-gray-300"
              min="1900"
              max={new Date().getFullYear()}
              disabled={saving}
            />
          </div>

          <div className="group">
            <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-red-600" />
              <span>{formData.completed ? 'End Year *' : 'Expected End Year'}</span>
            </label>
            <input
              type="number"
              value={formData.endYear}
              onChange={(e) => handleFormChange('endYear', parseInt(e.target.value) || new Date().getFullYear())}
              className="input-field transition-all duration-300 group-hover:border-gray-300"
              min={formData.startYear}
              max={new Date().getFullYear() + 10}
              disabled={saving}
            />
          </div>

          <div className="lg:col-span-2">
            <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-200 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.completed}
                onChange={(e) => handleFormChange('completed', e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-600 transform scale-110"
                disabled={saving}
              />
              <div>
                <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                  I have completed this qualification
                </span>
                <p className="text-sm text-gray-600">Uncheck if you're still studying</p>
              </div>
            </label>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Grade / GPA</label>
            <input
              type="text"
              value={formData.grade}
              onChange={(e) => handleFormChange('grade', e.target.value)}
              className="input-field transition-all duration-300 group-hover:border-gray-300"
              placeholder="e.g., Distinction, 3.8 GPA, 75%"
              disabled={saving}
            />
          </div>

          <div className="lg:col-span-2 group">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Description & Achievements</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              className="input-field transition-all duration-300 group-hover:border-gray-300 resize-none"
              placeholder="Describe your coursework, projects, honors, or special achievements..."
              disabled={saving}
            />
            <div className="text-xs text-gray-500 mt-2 flex justify-between">
              <span>Highlight academic achievements and relevant projects</span>
              <span>{formData.description.length}/500 characters</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 hover:border-gray-400 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.institution || !formData.qualification || !formData.startYear || !formData.endYear}
            className="bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Save className="h-5 w-5" />
            )}
            <span>{saving ? 'Saving...' : (editingId ? 'Update Education' : 'Add Education')}</span>
          </button>
        </div>
      </div>
    );
  };

  const renderEducationList = () => {
    if (education.length === 0 && !isEditing) {
      return (
        <div className="card p-12 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <GraduationCap className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Education Added Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto text-lg">
            Build your academic profile by adding your qualifications. 
            This helps South African employers understand your educational background.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleAdd}
              className="bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Your First Qualification</span>
            </button>
            <Link
              to="/experience"
              className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <Briefcase className="h-5 w-5" />
              <span>Add Experience Instead</span>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {education.map((edu) => {
          const QualificationIcon = getQualificationIcon(edu.qualificationType);
          return (
            <div 
              key={edu._id || edu.id} 
              className="card p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group border-l-4 border-l-blue-500"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                      <QualificationIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {edu.qualification}
                        </h3>
                        <div className="flex items-center space-x-2 mt-2 lg:mt-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getQualificationColor(edu.qualificationType)}`}>
                            {qualificationTypes.find(t => t.value === edu.qualificationType)?.label || edu.qualificationType}
                          </span>
                          {!edu.completed && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                              In Progress
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-lg text-gray-700 font-semibold mb-3">{edu.institution}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {edu.startYear} - {edu.completed ? edu.endYear : 'Present'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {calculateDuration(edu.startYear, edu.completed ? edu.endYear : new Date().getFullYear())}
                          </span>
                        </div>
                        {edu.field && (
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span className="text-sm">{edu.field}</span>
                          </div>
                        )}
                        {edu.grade && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-semibold text-yellow-600">{edu.grade}</span>
                          </div>
                        )}
                      </div>

                      {edu.description && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed">{edu.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 lg:pl-4 mt-4 lg:mt-0">
                  <button
                    onClick={() => handleEdit(edu)}
                    disabled={saving}
                    className="p-3 text-blue-600 hover:bg-blue-600/10 rounded-xl transition-all duration-300 transform hover:scale-110 group/edit"
                    title="Edit education"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(edu._id || edu.id)}
                    disabled={saving}
                    className="p-3 text-red-600 hover:bg-red-600/10 rounded-xl transition-all duration-300 transform hover:scale-110 group/delete"
                    title="Delete education"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTips = () => {
    if (education.length === 0) return null;

    return (
      <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-green-600" />
          <span>Education Best Practices</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-3">
            <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Include relevant coursework and projects</span>
          </div>
          <div className="flex items-start space-x-3">
            <Target className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Highlight academic achievements and honors</span>
          </div>
          <div className="flex items-start space-x-3">
            <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">Mention relevant skills gained during studies</span>
          </div>
          <div className="flex items-start space-x-3">
            <Crown className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">List extracurricular activities and leadership roles</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {renderSidebar()}

          {/* Enhanced Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {renderHeader()}
            {renderEditingForm()}
            {renderEducationList()}
            {renderTips()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;