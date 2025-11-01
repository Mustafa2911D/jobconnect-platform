import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { applicationsAPI, employerAPI, userAPI } from '../api/apiClient.js';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Info, 
  AlertTriangle, 
  Users, 
  FileText, 
  Calendar, 
  Eye, 
  Briefcase, 
  Loader,
  Trash2,
  Check,
  MoreVertical,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Clock,
  Zap,
  Mail,
  Settings
} from 'lucide-react';
import socketService from '../utils/socketService.js';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedNotifications, setExpandedNotifications] = useState(new Set());

  // Constants
  const filterOptions = ['all', 'unread', 'urgent', 'applications'];

  // Effects
  useEffect(() => {
    loadRealNotifications();
    setupSocketListeners();
    requestNotificationPermission();
  }, [user]);

  useEffect(() => {
    const handleApplicationStatusUpdate = (data) => {
      if (data.type === 'APPLICATION_STATUS_UPDATED') {
        const newNotification = createStatusNotification(data);
        setNotifications(prev => [newNotification, ...prev]);
        
        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          });
        }
      }
    };

    socketService.onApplicationStatusUpdated(handleApplicationStatusUpdate);

    return () => {
      socketService.off('application-status-updated', handleApplicationStatusUpdate);
    };
  }, [user]);

  // Utility Functions
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const setupSocketListeners = () => {
    socketService.onApplicationStatusUpdated((data) => {
      if (data.type === 'APPLICATION_STATUS_UPDATED') {
        const newNotification = createStatusNotification(data);
        setNotifications(prev => [newNotification, ...prev]);
      }
    });
  };

  const createStatusNotification = (data) => {
    const statusConfig = {
      accepted: {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      rejected: {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      },
      default: {
        icon: Info,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      }
    };

    const config = statusConfig[data.status] || statusConfig.default;

    return {
      id: `status-${data.applicationId}-${Date.now()}`,
      type: 'application_update',
      title: `Application ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`,
      message: data.message,
      time: 'Just now',
      read: false,
      action: 'View Details',
      route: user?.role === 'employer' ? '/employer/applications' : '/candidate/dashboard',
      icon: config.icon,
      color: config.color,
      bgColor: config.bgColor,
      borderColor: config.borderColor,
      priority: 1,
      urgent: data.status === 'accepted'
    };
  };

  const loadRealNotifications = async () => {
    try {
      setLoading(true);
      let realNotifications = [];

      if (user?.role === 'employer') {
        realNotifications = await loadEmployerNotifications();
      } else {
        realNotifications = await loadCandidateNotifications();
      }

      realNotifications.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return new Date(b.time) - new Date(a.time);
      });

      setNotifications(realNotifications);

    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications(generateSampleNotifications());
    } finally {
      setLoading(false);
    }
  };

  const loadEmployerNotifications = async () => {
    const [applicationsResponse, jobsResponse] = await Promise.all([
      employerAPI.getAllApplications().catch(() => ({ data: { applications: [] } })),
      employerAPI.getCurrentJobs().catch(() => ({ data: { jobs: [] } }))
    ]);

    const applications = applicationsResponse.data.applications || [];
    const jobs = jobsResponse.data.jobs || [];
    
    return [
      ...applications
        .filter(app => {
          const appDate = new Date(app.createdAt);
          const now = new Date();
          const diffHours = (now - appDate) / (1000 * 60 * 60);
          return diffHours <= 24 && app.status === 'pending';
        })
        .map((app, index) => ({
          id: `app-${app._id}`,
          type: 'application',
          title: 'New Application Received',
          message: `${app.candidate?.name || 'A candidate'} applied for ${app.job?.title || 'your job'}`,
          time: formatNotificationTime(app.createdAt),
          read: false,
          action: 'Review Application',
          route: '/employer/applications',
          icon: Users,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          priority: 1,
          urgent: true
        })),
      
      ...applications
        .filter(app => app.status !== 'pending')
        .map((app, index) => ({
          id: `status-${app._id}`,
          type: 'application_update',
          title: `Application ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}`,
          message: `${app.candidate?.name || 'Candidate'} - ${app.job?.title || 'Job'}`,
          time: formatNotificationTime(app.updatedAt),
          read: true,
          action: 'View Details',
          route: '/employer/applications',
          icon: CheckCircle,
          color: app.status === 'accepted' ? 'text-green-500' : 
                 app.status === 'rejected' ? 'text-red-500' : 'text-blue-500',
          bgColor: app.status === 'accepted' ? 'bg-green-50' : 
                   app.status === 'rejected' ? 'bg-red-50' : 'bg-blue-50',
          borderColor: app.status === 'accepted' ? 'border-green-200' : 
                       app.status === 'rejected' ? 'border-red-200' : 'border-blue-200',
          priority: 2
        })),

      ...jobs
        .filter(job => {
          if (!job.deadline) return false;
          const deadline = new Date(job.deadline);
          const now = new Date();
          const diffDays = (deadline - now) / (1000 * 60 * 60 * 24);
          return diffDays <= 3 && diffDays > 0;
        })
        .map((job, index) => ({
          id: `deadline-${job._id}`,
          type: 'deadline_reminder',
          title: 'Job Expiring Soon',
          message: `"${job.title}" expires in ${Math.ceil((new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days`,
          time: formatNotificationTime(job.deadline),
          read: false,
          action: 'Extend Deadline',
          route: '/employer/jobs',
          icon: Calendar,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          priority: 3,
          urgent: true
        })),

      {
        id: 'system-1',
        type: 'system',
        title: 'Profile Completion',
        message: 'Complete your company profile to attract more candidates and increase your hiring success rate by 40%',
        time: '2 days ago',
        read: false,
        action: 'Complete Profile',
        route: '/employer/profile',
        icon: TrendingUp,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        priority: 4
      }
    ];
  };

  const loadCandidateNotifications = async () => {
    const [applicationsResponse, profileResponse] = await Promise.all([
      applicationsAPI.getCandidateApplications().catch(() => ({ data: { applications: [] } })),
      userAPI.getProfile().catch(() => ({ data: { user: {} } }))
    ]);

    const applications = applicationsResponse.data.applications || [];
    const profile = profileResponse.data.user || {};

    return [
      ...applications.map((app, index) => ({
        id: `app-${app._id}`,
        type: 'application_submitted',
        title: 'Application Submitted',
        message: `You applied for ${app.job?.title} at ${app.job?.company}`,
        time: formatNotificationTime(app.createdAt),
        read: true,
        action: 'View Application',
        route: '/candidate/dashboard',
        icon: FileText,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        priority: 1
      })),

      ...applications
        .filter(app => app.status !== 'pending')
        .map((app, index) => ({
          id: `status-${app._id}`,
          type: 'application_update',
          title: `Application ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}`,
          message: `${app.job?.title} at ${app.job?.company}`,
          time: formatNotificationTime(app.updatedAt),
          read: app.status === 'pending',
          action: 'View Details',
          route: '/candidate/dashboard',
          icon: app.status === 'accepted' ? CheckCircle : 
                app.status === 'rejected' ? XCircle : Info,
          color: app.status === 'accepted' ? 'text-green-500' : 
                 app.status === 'rejected' ? 'text-red-500' : 'text-blue-500',
          bgColor: app.status === 'accepted' ? 'bg-green-50' : 
                   app.status === 'rejected' ? 'bg-red-50' : 'bg-blue-50',
          borderColor: app.status === 'accepted' ? 'border-green-200' : 
                       app.status === 'rejected' ? 'border-red-200' : 'border-blue-200',
          priority: 2,
          urgent: app.status === 'accepted'
        })),

      {
        id: 'profile-reminder',
        type: 'profile_reminder',
        title: 'Complete Your Profile',
        message: 'Add your skills, experience, and portfolio to increase your chances of getting hired by 65%',
        time: '1 day ago',
        read: false,
        action: 'Complete Profile',
        route: '/profile',
        icon: Sparkles,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        priority: 3
      },

      {
        id: 'job-recommendation',
        type: 'job_match',
        title: 'New Job Matches',
        message: 'We found 3 new jobs that match your profile perfectly based on your skills and preferences',
        time: '3 hours ago',
        read: false,
        action: 'View Jobs',
        route: '/jobs',
        icon: Zap,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        priority: 4
      }
    ];
  };

  const generateSampleNotifications = () => {
    // ... (keep your existing sample data generation)
    return []; // Your existing sample data
  };

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Event Handlers
  const markAsRead = (id, e) => {
    e?.stopPropagation();
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id, e) => {
    e?.stopPropagation();
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const toggleNotificationExpand = (id) => {
    const newExpanded = new Set(expandedNotifications);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNotifications(newExpanded);
  };

  const handleActionClick = (notification, e) => {
    e?.stopPropagation();
    markAsRead(notification.id);
  };

  // Filter Functions
  const getFilteredNotifications = () => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'urgent':
        return notifications.filter(n => n.urgent);
      case 'applications':
        return notifications.filter(n => n.type.includes('application'));
      default:
        return notifications;
    }
  };

  const getIcon = (notification) => {
    return <notification.icon className={`h-5 w-5 ${notification.color}`} />;
  };

  // Computed Values
  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = getFilteredNotifications();

  // Quick Actions Data
  const employerQuickActions = [
    {
      to: "/employer/applications",
      icon: Users,
      title: "Manage Applications",
      description: "Review and respond to candidate applications",
      gradient: "from-green-50 to-emerald-100",
      border: "border-green-200",
      iconColor: "text-green-600"
    },
    {
      to: "/employer/jobs/new",
      icon: FileText,
      title: "Post New Job",
      description: "Create a new job listing to attract talent",
      gradient: "from-blue-50 to-cyan-100",
      border: "border-blue-200",
      iconColor: "text-blue-600"
    },
    {
      to: "/employer/analytics",
      icon: TrendingUp,
      title: "View Analytics",
      description: "Track your hiring performance and metrics",
      gradient: "from-purple-50 to-violet-100",
      border: "border-purple-200",
      iconColor: "text-purple-600"
    },
    {
      to: "/employer/profile",
      icon: Settings,
      title: "Company Profile",
      description: "Update your company information",
      gradient: "from-yellow-50 to-amber-100",
      border: "border-yellow-200",
      iconColor: "text-yellow-600"
    }
  ];

  const candidateQuickActions = [
    {
      to: "/profile",
      icon: FileText,
      title: "Update Profile",
      description: "Complete your profile for better matches",
      gradient: "from-green-50 to-emerald-100",
      border: "border-green-200",
      iconColor: "text-green-600"
    },
    {
      to: "/jobs?alerts=true",
      icon: Bell,
      title: "Job Alerts",
      description: "Set up alerts for new opportunities",
      gradient: "from-blue-50 to-cyan-100",
      border: "border-blue-200",
      iconColor: "text-blue-600"
    },
    {
      to: "/jobs",
      icon: Briefcase,
      title: "Browse Jobs",
      description: "Explore new career opportunities",
      gradient: "from-purple-50 to-violet-100",
      border: "border-purple-200",
      iconColor: "text-purple-600"
    },
    {
      to: "/candidate/dashboard",
      icon: CheckCircle,
      title: "My Applications",
      description: "Track your job applications",
      gradient: "from-yellow-50 to-amber-100",
      border: "border-yellow-200",
      iconColor: "text-yellow-600"
    }
  ];

  const quickActions = user?.role === 'employer' ? employerQuickActions : candidateQuickActions;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center mb-4">
              <div className="relative">
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-green-600 to-blue-800 bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-gray-600 text-lg">
                  {user?.role === 'employer' 
                    ? 'Stay updated with your hiring activities' 
                    : 'Stay updated with your job search journey'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
              {filterOptions.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeFilter === filter
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={markAllAsRead}
              className="bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center"
            >
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800 mb-1">Total</p>
                <p className="text-2xl font-bold text-green-900">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="card p-6 bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">Unread</p>
                <p className="text-2xl font-bold text-blue-900">{unreadCount}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="card p-6 bg-gradient-to-br from-yellow-50 to-amber-100 border border-yellow-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">Urgent</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {notifications.filter(n => n.urgent).length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="card p-6 bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800 mb-1">Applications</p>
                <p className="text-2xl font-bold text-purple-900">
                  {notifications.filter(n => n.type.includes('application')).length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => toggleNotificationExpand(notification.id)}
                className={`relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:shadow-lg ${
                  notification.read 
                    ? `${notification.bgColor} ${notification.borderColor} opacity-75` 
                    : `${notification.bgColor} ${notification.borderColor} shadow-md`
                } ${expandedNotifications.has(notification.id) ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
              >
                {/* Unread indicator */}
                {!notification.read && (
                  <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}

                {/* Urgent badge */}
                {notification.urgent && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                    Urgent
                  </div>
                )}

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`p-3 rounded-xl ${notification.bgColor.replace('bg-', 'bg-')} border ${notification.borderColor}`}>
                      {getIcon(notification)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`font-bold text-lg ${
                            notification.read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        
                        <p className={`text-gray-600 mb-3 ${
                          expandedNotifications.has(notification.id) ? '' : 'line-clamp-2'
                        }`}>
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {notification.time}
                            </span>
                            <Link
                              to={notification.route}
                              onClick={(e) => handleActionClick(notification, e)}
                              className="flex items-center space-x-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors duration-200 group"
                            >
                              <span>{notification.action}</span>
                              <ExternalLink className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform duration-200" />
                            </Link>
                          </div>
                          
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {!notification.read && (
                              <button
                                onClick={(e) => markAsRead(notification.id, e)}
                                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-all duration-200"
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => deleteNotification(notification.id, e)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200"
                              title="Delete notification"
                              >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <Bell className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No notifications found</h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                {activeFilter === 'all' 
                  ? "You're all caught up! New notifications will appear here as they come in."
                  : `No ${activeFilter} notifications found. Try changing your filter.`}
              </p>
              {activeFilter !== 'all' && (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="btn-primary px-8 py-3 transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  Show All Notifications
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.to} className="group">
                <div className={`card p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br ${action.gradient} ${action.border}`}>
                  <action.icon className={`h-12 w-12 ${action.iconColor} mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;