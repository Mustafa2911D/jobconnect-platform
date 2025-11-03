import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Save, Bell, Eye, Shield, Palette, Globe, Moon, Sun, 
  Smartphone, Mail, Users, Lock, EyeOff, Zap, Rocket,
  CheckCircle, X, RefreshCw, Download, Upload, Trash2,
  Wifi, WifiOff, Database, Cpu, HardDrive, ShieldCheck,
  Languages, MapPin, Clock, CreditCard, UserCheck,
  Volume2, VolumeX, Vibrate, Battery, Wrench, Settings as SettingsIcon,
  ArrowRight, Key
} from 'lucide-react';
import { showToast } from '../utils/toast.js';
import { userAPI, employerAPI } from '../api/apiClient.js';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      showToast('Please type "DELETE" to confirm', 'error');
      return;
    }

    if (!password) {
      showToast('Please enter your password', 'error');
      return;
    }

    setDeleting(true);
    try {
      await onConfirm(password);
      onClose();
    } catch (error) {
      // Error handled in parent
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-red-600 mb-4">Delete Account</h3>
        
        <p className="text-gray-600 mb-4">
          This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter your password to confirm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-bold">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 uppercase"
              placeholder="DELETE"
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Separate Password Change Component 
const PasswordChangeForm = ({ onChangePassword, passwordChanged }) => {
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleCurrentPasswordChange = useCallback((e) => {
    setChangePasswordData(prev => ({
      ...prev,
      currentPassword: e.target.value
    }));
  }, []);

  const handleNewPasswordChange = useCallback((e) => {
    setChangePasswordData(prev => ({
      ...prev,
      newPassword: e.target.value
    }));
  }, []);

  const handleConfirmPasswordChange = useCallback((e) => {
    setChangePasswordData(prev => ({
      ...prev,
      confirmPassword: e.target.value
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    await onChangePassword(changePasswordData);
    setChangingPassword(false);
  };

  return (
    <div className="p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <Shield className="h-5 w-5 text-green-600 mr-2" />
        Change Password
      </h3>
      
      {passwordChanged && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800 text-sm">
              Password changed successfully! You'll need to use your new password next time you sign in.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={changePasswordData.currentPassword}
              onChange={handleCurrentPasswordChange}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 bg-white"
              placeholder="Enter current password"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={changePasswordData.newPassword}
              onChange={handleNewPasswordChange}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 bg-white"
              placeholder="Enter new password"
              minLength="6"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={changePasswordData.confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 bg-white"
              placeholder="Confirm new password"
              minLength="6"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {changePasswordData.confirmPassword && changePasswordData.newPassword !== changePasswordData.confirmPassword && (
            <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
          )}
          {changePasswordData.confirmPassword && changePasswordData.newPassword === changePasswordData.confirmPassword && (
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Passwords match
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={changingPassword || 
            !changePasswordData.currentPassword || 
            !changePasswordData.newPassword || 
            !changePasswordData.confirmPassword ||
            changePasswordData.newPassword !== changePasswordData.confirmPassword ||
            changePasswordData.newPassword.length < 6}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-base font-medium text-white bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {changingPassword ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Changing Password...
            </>
          ) : (
            'Change Password'
          )}
        </button>
      </form>
    </div>
  );
};

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  // Constants
  const provinces = [
    'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 
    'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape'
  ];

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'af', name: 'Afrikaans', native: 'Afrikaans' },
    { code: 'zu', name: 'Zulu', native: 'isiZulu' },
    { code: 'xh', name: 'Xhosa', native: 'isiXhosa' },
    { code: 'st', name: 'Sotho', native: 'Sesotho' },
    { code: 'tn', name: 'Tswana', native: 'Setswana' }
  ];

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Manage your alerts and notifications' },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield, description: 'Control your privacy and security settings' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Customize the look and feel' },
    { id: 'regional', label: 'Regional', icon: Globe, description: 'Language and regional preferences' },
    { id: 'account', label: 'Account', icon: SettingsIcon, description: 'Account management settings' }
  ];

  // Default settings structure
  const defaultSettings = {
    notifications: user?.role === 'employer' ? {
      newApplications: true,
      candidateMessages: true,
      jobExpiry: true,
      newsletter: true,
      smsNotifications: false,
      pushNotifications: true,
      emailDigest: true,
      urgentAlerts: true
    } : {
      jobAlerts: true,
      applicationUpdates: true,
      newMessages: true,
      newsletter: false,
      smsNotifications: false,
      pushNotifications: true,
      emailDigest: false,
      urgentAlerts: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowMessages: true,
      dataSharing: false,
      searchVisibility: true,
      activityStatus: true,
      twoFactorAuth: false
    },
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      density: 'comfortable',
      reduceAnimations: false,
      highContrast: false,
      colorBlind: false
    },
    regional: {
      language: 'en',
      timezone: 'Africa/Johannesburg',
      currency: 'ZAR',
      province: 'Gauteng',
      dateFormat: 'DD/MM/YYYY',
      temperature: 'celsius'
    },
    account: {
      emailFrequency: 'weekly',
      autoBackup: true,
      downloadData: false,
      deleteAccount: false
    }
  };

  // State Management
  const [settings, setSettings] = useState(defaultSettings);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Load settings from backend
  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getSettings();
      
      if (response.data.success) {
        setSettings(prev => ({
          ...prev,
          ...response.data.settings
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showToast('Error loading settings. Using defaults.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Helper Components
  const CustomSwitch = ({ checked, onChange, disabled = false }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className={`w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
    </label>
  );

  const SettingCard = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg ${className}`}>
      {children}
    </div>
  );

  // Event Handlers
  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handlePasswordChange = async (passwordData) => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Password changed successfully!', 'success');
        setPasswordChanged(true);
        
        // Reset success message after 5 seconds
        setTimeout(() => setPasswordChanged(false), 5000);
      } else {
        showToast(data.message || 'Error changing password', 'error');
      }
    } catch (error) {
      console.error('Change password error:', error);
      showToast('Network error. Please try again.', 'error');
    }
  };

  // Save settings to backend
  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await userAPI.updateSettings(settings);
      
      if (response.data.success) {
        showToast('Settings saved successfully! 🎉', 'success');
        if (response.data.user) {
          updateUser(response.data.user);
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (password) => {
    try {
      console.log('Starting account deletion for role:', user?.role);
      
      let response;
      
      // API based on user role
      if (user?.role === 'employer') {
        console.log('Using employer API for deletion');
        response = await employerAPI.deleteAccount(password);
      } else {
        console.log('Using user API for deletion');
        response = await userAPI.deleteAccount(password);
      }
      
      console.log('Delete account response:', response);
      
      if (response.data.success) {
        showToast('Account deleted successfully', 'success');
        logout();
      }
    } catch (error) {
      console.error('Delete account error:', error);
      const errorMessage = error.response?.data?.message || 'Error deleting account';
      showToast(errorMessage, 'error');
      throw error;
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings(defaultSettings);
      showToast('Settings reset to defaults', 'success');
    }
  };

  const downloadUserData = async () => {
    try {
      showToast('Preparing your data download...', 'info');
      
      const userData = {
        exportedAt: new Date().toISOString(),
        platform: 'JobConnect',
        version: '1.0.0',
        user: {
          profile: {
            name: user?.name,
            email: user?.email,
            role: user?.role,
            headline: user?.profile?.headline,
            bio: user?.profile?.bio,
            location: user?.profile?.location,
            contact: user?.profile?.contact,
            avatar: user?.profile?.avatar
          },
          professional: {
            skills: user?.skills || [],
            experience: user?.experience || [],
            education: user?.education || [],
            resume: user?.resume
          },
          preferences: {
            jobAlerts: user?.jobAlerts || [],
            savedJobs: user?.savedJobs || [],
            notificationSettings: settings.notifications
          }
        },
        activity: {
          accountCreated: user?.createdAt,
          lastActive: user?.stats?.lastActive,
          profileViews: user?.stats?.profileViews,
          jobApplications: user?.stats?.jobApplications,
          careerStats: user?.stats?.careerStats,
          employerStats: user?.stats?.employerStats
        },
        settings: {
          privacy: settings.privacy,
          appearance: settings.appearance,
          regional: settings.regional,
          account: settings.account
        },
        exportInfo: {
          format: 'JSON',
          includesSensitiveData: false,
          dataTypes: ['profile', 'professional', 'activity', 'settings']
        }
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jobconnect-data-${user?.name?.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Your data has been downloaded successfully! 📥', 'success');
    } catch (error) {
      console.error('Error downloading user data:', error);
      showToast('Error downloading your data. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your settings...</p>
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
            Settings & Preferences
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Customize your JobConnect experience and manage your preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-6 space-y-6">
              <div className="card p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Settings Menu</h3>
                  <p className="text-sm text-gray-600">Customize your experience</p>
                </div>

                <nav className="space-y-2">
                  {tabs.map(tab => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full group flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-green-600 to-blue-800 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gradient-to-r hover:from-green-600/10 hover:to-blue-800/10 hover:text-green-600 hover:shadow-md'
                        }`}
                      >
                        <IconComponent className={`h-5 w-5 transition-colors ${
                          activeTab === tab.id ? 'text-white' : 'text-gray-600 group-hover:text-green-600'
                        }`} />
                        <div className="flex-1">
                          <div className="font-medium">{tab.label}</div>
                          <div className={`text-xs ${
                            activeTab === tab.id ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {tab.description}
                          </div>
                        </div>
                        {activeTab === tab.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {saving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  
                  <button
                    onClick={resetToDefaults}
                    className="w-full border-2 border-gray-300 text-gray-700 hover:border-gray-400 font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Reset to Defaults</span>
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span>Settings Overview</span>
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Active Notifications</span>
                    <span className="font-bold text-green-600">
                      {Object.values(settings.notifications).filter(Boolean).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Privacy Level</span>
                    <span className="font-bold text-blue-600 capitalize">
                      {settings.privacy.profileVisibility}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Theme</span>
                    <span className="font-bold text-purple-600 capitalize">
                      {settings.appearance.theme}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Language</span>
                    <span className="font-bold text-orange-600">
                      {languages.find(lang => lang.code === settings.regional.language)?.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {user?.role === 'employer' ? 'Employer Notifications' : 'Candidate Notifications'}
                    </h2>
                    <p className="text-gray-600 mt-2">
                      Control how and when you receive notifications
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Bell className="h-4 w-4" />
                    <span>Real-time alerts</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {user?.role === 'employer' ? (
                    <>
                      <SettingCard className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                              <Users className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">New Applications</h3>
                              <p className="text-gray-600 text-sm">When candidates apply to your jobs</p>
                            </div>
                          </div>
                          <CustomSwitch
                            checked={settings.notifications.newApplications}
                            onChange={(e) => handleSettingChange('notifications', 'newApplications', e.target.checked)}
                          />
                        </div>
                      </SettingCard>

                      <SettingCard className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                              <Mail className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Candidate Messages</h3>
                              <p className="text-gray-600 text-sm">Direct messages from candidates</p>
                            </div>
                          </div>
                          <CustomSwitch
                            checked={settings.notifications.candidateMessages}
                            onChange={(e) => handleSettingChange('notifications', 'candidateMessages', e.target.checked)}
                          />
                        </div>
                      </SettingCard>

                      <SettingCard className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                              <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Job Expiry Alerts</h3>
                              <p className="text-gray-600 text-sm">Before job postings expire</p>
                            </div>
                          </div>
                          <CustomSwitch
                            checked={settings.notifications.jobExpiry}
                            onChange={(e) => handleSettingChange('notifications', 'jobExpiry', e.target.checked)}
                          />
                        </div>
                      </SettingCard>
                    </>
                  ) : (
                    <>
                      <SettingCard className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                              <Bell className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Job Alerts</h3>
                              <p className="text-gray-600 text-sm">New jobs matching your criteria</p>
                            </div>
                          </div>
                          <CustomSwitch
                            checked={settings.notifications.jobAlerts}
                            onChange={(e) => handleSettingChange('notifications', 'jobAlerts', e.target.checked)}
                          />
                        </div>
                      </SettingCard>

                      <SettingCard className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                              <RefreshCw className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Application Updates</h3>
                              <p className="text-gray-600 text-sm">Status changes on your applications</p>
                            </div>
                          </div>
                          <CustomSwitch
                            checked={settings.notifications.applicationUpdates}
                            onChange={(e) => handleSettingChange('notifications', 'applicationUpdates', e.target.checked)}
                          />
                        </div>
                      </SettingCard>

                      <SettingCard className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                              <Mail className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">New Messages</h3>
                              <p className="text-gray-600 text-sm">Messages from employers</p>
                            </div>
                          </div>
                          <CustomSwitch
                            checked={settings.notifications.newMessages}
                            onChange={(e) => handleSettingChange('notifications', 'newMessages', e.target.checked)}
                          />
                        </div>
                      </SettingCard>
                    </>
                  )}

                  {/* Common Notifications */}
                  <SettingCard className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Push Notifications</h3>
                          <p className="text-gray-600 text-sm">Real-time mobile notifications</p>
                        </div>
                      </div>
                      <CustomSwitch
                        checked={settings.notifications.pushNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                      />
                    </div>
                  </SettingCard>

                  <SettingCard className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                          <Zap className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Urgent Alerts</h3>
                          <p className="text-gray-600 text-sm">Critical time-sensitive updates</p>
                        </div>
                      </div>
                      <CustomSwitch
                        checked={settings.notifications.urgentAlerts}
                        onChange={(e) => handleSettingChange('notifications', 'urgentAlerts', e.target.checked)}
                      />
                    </div>
                  </SettingCard>
                </div>
              </div>
            )}

            {/* Privacy & Security Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Privacy & Security</h2>
                    <p className="text-gray-600 mt-2">Control your privacy and secure your account</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Protected</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SettingCard className="p-6 lg:col-span-2">
                    <h3 className="font-semibold text-gray-900 mb-4">Profile Visibility</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'public', label: 'Public', description: 'Visible to everyone', icon: Globe },
                        { id: 'connections', label: 'Connections Only', description: 'Visible to your connections', icon: Users },
                        { id: 'private', label: 'Private', description: 'Only visible to you', icon: Lock }
                      ].map(visibility => {
                        const IconComponent = visibility.icon;
                        return (
                          <label key={visibility.id} className="relative group cursor-pointer">
                            <input
                              type="radio"
                              name="visibility"
                              checked={settings.privacy.profileVisibility === visibility.id}
                              onChange={() => handleSettingChange('privacy', 'profileVisibility', visibility.id)}
                              className="sr-only peer"
                            />
                            <div className="p-4 border-2 border-gray-200 rounded-2xl cursor-pointer peer-checked:border-green-600 peer-checked:bg-green-600/5 transition-all duration-300 group-hover:border-green-400">
                              <div className="flex items-center space-x-3">
                                <IconComponent className="h-5 w-5 text-gray-600 peer-checked:text-green-600" />
                                <div>
                                  <div className="font-medium text-gray-900">{visibility.label}</div>
                                  <p className="text-gray-600 text-sm">{visibility.description}</p>
                                </div>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </SettingCard>

                  <SettingCard className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Show Email</h3>
                          <p className="text-gray-600 text-sm">
                            {user?.role === 'employer' ? 'To candidates' : 'To employers'}
                          </p>
                        </div>
                      </div>
                      <CustomSwitch
                        checked={settings.privacy.showEmail}
                        onChange={(e) => handleSettingChange('privacy', 'showEmail', e.target.checked)}
                      />
                    </div>
                  </SettingCard>

                  <SettingCard className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Allow Messages</h3>
                          <p className="text-gray-600 text-sm">
                            {user?.role === 'employer' ? 'From candidates' : 'From employers'}
                          </p>
                        </div>
                      </div>
                      <CustomSwitch
                        checked={settings.privacy.allowMessages}
                        onChange={(e) => handleSettingChange('privacy', 'allowMessages', e.target.checked)}
                      />
                    </div>
                  </SettingCard>

                  <SettingCard className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Two-Factor Auth</h3>
                          <p className="text-gray-600 text-sm">Extra security for your account</p>
                        </div>
                      </div>
                      <CustomSwitch
                        checked={settings.privacy.twoFactorAuth}
                        onChange={(e) => handleSettingChange('privacy', 'twoFactorAuth', e.target.checked)}
                      />
                    </div>
                  </SettingCard>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Appearance</h2>
                    <p className="text-gray-600 mt-2">Customize how JobConnect looks and feels</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Palette className="h-4 w-4" />
                    <span>Customizable</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SettingCard className="p-6 lg:col-span-2">
                    <h3 className="font-semibold text-gray-900 mb-4">Theme</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'light', label: 'Light', icon: Sun, description: 'Clean and bright' },
                        { id: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes' }
                      ].map(theme => {
                        const IconComponent = theme.icon;
                        return (
                          <label key={theme.id} className="relative group cursor-pointer">
                            <input
                              type="radio"
                              name="theme"
                              checked={settings.appearance.theme === theme.id}
                              onChange={() => handleSettingChange('appearance', 'theme', theme.id)}
                              className="sr-only peer"
                            />
                            <div className="p-4 border-2 border-gray-200 rounded-2xl cursor-pointer peer-checked:border-green-600 peer-checked:bg-green-600/5 transition-all duration-300 group-hover:border-green-400">
                              <div className="flex items-center space-x-3">
                                <IconComponent className="h-5 w-5 text-gray-600 peer-checked:text-green-600" />
                                <div>
                                  <div className="font-medium text-gray-900">{theme.label}</div>
                                  <p className="text-gray-600 text-sm">{theme.description}</p>
                                </div>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </SettingCard>

                  <SettingCard className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Font Size</h3>
                    <div className="space-y-3">
                      {['small', 'medium', 'large'].map(size => (
                        <label key={size} className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="fontSize"
                            checked={settings.appearance.fontSize === size}
                            onChange={() => handleSettingChange('appearance', 'fontSize', size)}
                            className="text-green-600 focus:ring-green-600"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 capitalize">{size}</div>
                            <p className="text-gray-600 text-sm">
                              {size === 'small' && 'Compact text for more content'}
                              {size === 'medium' && 'Balanced and readable'}
                              {size === 'large' && 'Larger text for better accessibility'}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </SettingCard>

                  <SettingCard className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Accessibility</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Reduce Animations</h4>
                          <p className="text-gray-600 text-sm">Minimize motion and transitions</p>
                        </div>
                        <CustomSwitch
                          checked={settings.appearance.reduceAnimations}
                          onChange={(e) => handleSettingChange('appearance', 'reduceAnimations', e.target.checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">High Contrast</h4>
                          <p className="text-gray-600 text-sm">Enhanced color contrast</p>
                        </div>
                        <CustomSwitch
                          checked={settings.appearance.highContrast}
                          onChange={(e) => handleSettingChange('appearance', 'highContrast', e.target.checked)}
                        />
                      </div>
                    </div>
                  </SettingCard>
                </div>
              </div>
            )}

            {/* Regional Tab */}
            {activeTab === 'regional' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Regional Settings</h2>
                    <p className="text-gray-600 mt-2">Adapt JobConnect to your location and preferences</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>South Africa</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SettingCard className="p-6">
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span>Preferred Province</span>
                    </label>
                    <select
                      value={settings.regional.province}
                      onChange={(e) => handleSettingChange('regional', 'province', e.target.value)}
                      className="input-field transition-all duration-300 hover:border-gray-300"
                    >
                      {provinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </SettingCard>

                  <SettingCard className="p-6">
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <Languages className="h-4 w-4 text-blue-600" />
                      <span>Language</span>
                    </label>
                    <select
                      value={settings.regional.language}
                      onChange={(e) => handleSettingChange('regional', 'language', e.target.value)}
                      className="input-field transition-all duration-300 hover:border-gray-300"
                    >
                      {languages.map(language => (
                        <option key={language.code} value={language.code}>
                          {language.name} ({language.native})
                        </option>
                      ))}
                    </select>
                  </SettingCard>

                  <SettingCard className="p-6">
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span>Timezone</span>
                    </label>
                    <select
                      value={settings.regional.timezone}
                      onChange={(e) => handleSettingChange('regional', 'timezone', e.target.value)}
                      className="input-field transition-all duration-300 hover:border-gray-300"
                    >
                      <option value="Africa/Johannesburg">South Africa Standard Time (SAST)</option>
                    </select>
                  </SettingCard>

                  <SettingCard className="p-6">
                    <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                      <span>Currency</span>
                    </label>
                    <select
                      value={settings.regional.currency}
                      onChange={(e) => handleSettingChange('regional', 'currency', e.target.value)}
                      className="input-field transition-all duration-300 hover:border-gray-300"
                    >
                      <option value="ZAR">South African Rand (ZAR) - R</option>
                    </select>
                  </SettingCard>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Account Settings</h2>
                    <p className="text-gray-600 mt-2">Manage your account data and preferences</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <SettingsIcon className="h-4 w-4" />
                    <span>Management</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Change Password Section */}
                  <SettingCard>
                    <PasswordChangeForm 
                      onChangePassword={handlePasswordChange}
                      passwordChanged={passwordChanged}
                    />
                  </SettingCard>

                  <SettingCard className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Data Management</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Auto Backup</h4>
                          <p className="text-gray-600 text-sm">Automatically backup your data weekly</p>
                        </div>
                        <CustomSwitch
                          checked={settings.account.autoBackup}
                          onChange={(e) => handleSettingChange('account', 'autoBackup', e.target.checked)}
                        />
                      </div>
                      
                      <button 
                        onClick={downloadUserData}
                        className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-300 transition-colors duration-300 group bg-gradient-to-r from-white to-gray-50 hover:from-green-50 hover:to-blue-50"
                      >
                        <div className="flex items-center space-x-3">
                          <Download className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">Download Your Data</div>
                            <p className="text-gray-600 text-sm">Export all your data in JSON format</p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                      </button>

                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                        <p className="text-sm text-blue-800 mb-2">📊 <strong>What's included in your data export:</strong></p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Profile information and settings</li>
                          <li>• Professional details (skills, experience, education)</li>
                          <li>• Activity history and statistics</li>
                          <li>• Saved jobs and preferences</li>
                          <li>• Application history</li>
                        </ul>
                      </div>
                    </div>
                  </SettingCard>

                  <SettingCard className="p-6 border-red-200 bg-red-50">
                    <h3 className="font-semibold mb-4 text-red-800">Danger Zone</h3>
                    <div className="space-y-4">
                      <button 
                        onClick={() => setDeleteModalOpen(true)}
                        className="w-full flex items-center justify-between p-4 border border-red-200 rounded-xl hover:border-red-300 transition-colors duration-300 group bg-red-50 hover:bg-red-100"
                      >
                        <div className="flex items-center space-x-3">
                          <Trash2 className="h-5 w-5 text-red-600" />
                          <div>
                            <div className="font-medium text-gray-900">Delete Account</div>
                            <p className="text-red-600 text-sm">Permanently delete your account and all data</p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-red-400 group-hover:text-red-600 transition-colors" />
                      </button>
                    </div>
                  </SettingCard>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
};

export default Settings;