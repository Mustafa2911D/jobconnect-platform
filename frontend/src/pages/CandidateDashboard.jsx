import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiClient, analyticsAPI, userAPI, applicationsAPI } from '../api/apiClient.js';
import { 
  Briefcase, Clock, CheckCircle, XCircle, AlertCircle, 
  TrendingUp, Eye, FileText, MapPin, Award, Bell, Settings,
  BarChart3, Target, Star, Download, Share2, Users, Calendar,
  Menu, X, Zap, Rocket, Crown, TrendingDown, UserCheck,
  MessageCircle, Bookmark, ExternalLink, ChevronRight,
  Sparkles, Lightbulb, Target as TargetIcon,
  Mail, Filter, Camera
} from 'lucide-react';
import { showToast } from '../utils/toast.js';
import getImageUrl from '../utils/imageUrl';

// Constants and Configuration
const quickActions = [
  { 
    icon: FileText, 
    label: 'Update CV', 
    color: 'bg-gradient-to-r from-green-600 to-emerald-600', 
    hoverColor: 'from-green-700 to-emerald-700',
    href: '/profile',
    description: 'Upload your latest resume',
    badge: 'Improve'
  },
  { 
    icon: Target, 
    label: 'Job Alerts', 
    color: 'bg-gradient-to-r from-blue-600 to-cyan-600', 
    hoverColor: 'from-blue-700 to-cyan-700',
    href: '/jobs?alerts=true',
    description: 'Set up job notifications',
    badge: 'New'
  },
  { 
    icon: BarChart3, 
    label: 'Career Stats', 
    color: 'bg-gradient-to-r from-purple-600 to-violet-600', 
    hoverColor: 'from-purple-700 to-violet-700',
    href: '/candidate/analytics',
    description: 'View your career progress'
  }
];

const perfectMatchesMock = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: 'Tech Innovations SA',
    location: 'Cape Town, Western Cape',
    match: 95,
    salary: 'R45,000 - R60,000',
    type: 'Full-time',
    urgent: true,
    logo: null,
    description: 'We are looking for an experienced Frontend Developer to join our dynamic team...',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    postedDate: '2024-01-10'
  },
  {
    id: 2,
    title: 'Full Stack Developer',
    company: 'Digital Solutions Ltd',
    location: 'Johannesburg, Gauteng',
    match: 88,
    salary: 'R40,000 - R55,000',
    type: 'Hybrid',
    featured: true,
    logo: null,
    description: 'Join our innovative team as a Full Stack Developer working on cutting-edge projects...',
    skills: ['JavaScript', 'Python', 'React', 'Django'],
    postedDate: '2024-01-12'
  },
  {
    id: 3,
    title: 'UX/UI Designer',
    company: 'Creative Labs',
    location: 'Remote',
    match: 92,
    salary: 'R35,000 - R50,000',
    type: 'Remote',
    logo: null,
    description: 'We need a creative UX/UI Designer to transform our digital products...',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
    postedDate: '2024-01-08'
  }
];

const calculateLocalProfileStrength = (userProfile) => {
  if (!userProfile) return 0;
  
  let score = 0;
  if (userProfile.name) score += 10;
  if (userProfile.email) score += 10;
  if (userProfile.profile?.headline) score += 15;
  if (userProfile.profile?.bio) score += 10;
  if (userProfile.profile?.location?.province) score += 10;
  if (userProfile.profile?.contact?.phone) score += 10;
  if (userProfile.skills?.length > 0) score += 15;
  if (userProfile.experience?.length > 0) score += 10;
  if (userProfile.education?.length > 0) score += 10;
  
  return Math.min(score, 100);
};

// Main Component
const CandidateDashboard = () => {
  // Hooks and State
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileStrength, setProfileStrength] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [perfectMatches, setPerfectMatches] = useState([]);

  // Effects
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // API Functions
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [applicationsResponse, profileResponse, strengthResponse] = await Promise.all([
        apiClient.get('/applications/candidate/my-applications'),
        apiClient.get('/auth/me'),
        userAPI.getProfileStrength().catch(error => {
          console.error('Error fetching profile strength:', error);
          return { data: { profileCompletion: calculateLocalProfileStrength(profileResponse?.data?.user) } };
        })
      ]);
      
      setApplications(applicationsResponse.data.applications || []);
      setProfile(profileResponse.data.user);
      setProfileStrength(strengthResponse.data.profileCompletion);
      calculateStats(applicationsResponse.data.applications || [], strengthResponse.data.profileCompletion);
      
      fetchPerfectMatches();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerfectMatches = async () => {
    try {
      setPerfectMatches(perfectMatchesMock);
    } catch (error) {
      console.error('Error fetching perfect matches:', error);
    }
  };

  // Data Processing Functions
  const calculateStats = (apps, strength) => {
    const statusCounts = {
      pending: apps.filter(app => app.status === 'pending').length,
      reviewed: apps.filter(app => app.status === 'reviewed').length,
      accepted: apps.filter(app => app.status === 'accepted').length,
      rejected: apps.filter(app => app.status === 'rejected').length,
    };

    setStats({
      total: apps.length,
      ...statusCounts,
      successRate: apps.length > 0 ? ((statusCounts.accepted / apps.length) * 100).toFixed(1) : 0,
      profileCompletion: strength,
      interviewRate: apps.length > 0 ? ((statusCounts.reviewed / apps.length) * 100).toFixed(1) : 0,
    });
  };

  // Event Handlers
  const handleExportDashboardData = () => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        candidate: {
          name: user?.name,
          email: user?.email,
          profileStrength: profileStrength
        },
        statistics: stats,
        applications: applications.map(app => ({
          jobTitle: app.job?.title,
          company: app.job?.company,
          status: app.status,
          appliedDate: app.createdAt,
          lastUpdated: app.updatedAt
        })),
        perfectMatches: perfectMatches.map(match => ({
          title: match.title,
          company: match.company,
          matchScore: match.match,
          salary: match.salary,
          type: match.type
        }))
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidate-dashboard-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Dashboard data exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting dashboard data:', error);
      showToast('Error exporting dashboard data', 'error');
    }
  };

  const handleShareDashboardSummary = async () => {
    try {
      const summary = `My Job Search Dashboard:
📊 Total Applications: ${stats.total}
✅ Success Rate: ${stats.successRate}%
🎯 Profile Strength: ${profileStrength}%
💼 Active Applications: ${stats.pending}

Check out my progress on JobConnect!`;

      if (navigator.share) {
        await navigator.share({
          title: 'My Job Search Dashboard',
          text: summary
        });
      } else {
        await navigator.clipboard.writeText(summary);
        showToast('Dashboard summary copied to clipboard!', 'success');
      }
    } catch (error) {
      console.error('Error sharing dashboard:', error);
    }
  };

  const handleBookmarkJob = async (jobId) => {
    try {
      showToast('Job saved to your bookmarks!', 'success');
      setPerfectMatches(prev => prev.map(job => 
        job.id === jobId ? { ...job, isBookmarked: true } : job
      ));
    } catch (error) {
      console.error('Error bookmarking job:', error);
      showToast('Error saving job', 'error');
    }
  };

  const handleShareJob = async (job) => {
    try {
      const jobUrl = `${window.location.origin}/jobs/${job.id}`;
      const shareText = `Check out this job: ${job.title} at ${job.company} - ${job.salary}`;

      if (navigator.share) {
        await navigator.share({
          title: job.title,
          text: shareText,
          url: jobUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${jobUrl}`);
        showToast('Job link copied to clipboard!', 'success');
      }
    } catch (error) {
      console.error('Error sharing job:', error);
    }
  };

  const handleMessageEmployer = async (application) => {
    try {
      showToast(`Opening conversation about ${application.job?.title}`, 'info');
    } catch (error) {
      console.error('Error messaging employer:', error);
      showToast('Error starting conversation', 'error');
    }
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Helper Functions
  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'reviewed':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Data Configuration
  const careerInsights = [
    {
      icon: TrendingUp,
      title: 'Application Success',
      value: `${stats.successRate}%`,
      change: '+5.2%',
      trend: 'up',
      description: 'Higher than last month'
    },
    {
      icon: UserCheck,
      title: 'Interview Rate',
      value: `${stats.interviewRate}%`,
      change: '+2.1%',
      trend: 'up',
      description: 'More companies responding'
    },
    {
      icon: Clock,
      title: 'Avg Response Time',
      value: '3.2 days',
      change: '-0.5 days',
      trend: 'down',
      description: 'Faster than average'
    },
    {
      icon: Crown,
      title: 'Profile Ranking',
      value: 'Top 15%',
      change: '+3 spots',
      trend: 'up',
      description: 'In your category'
    }
  ];

  const applicationTabs = [
    { key: 'overview', label: 'Overview', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'reviewed', label: 'Review', count: stats.reviewed },
    { key: 'accepted', label: 'Offers', count: stats.accepted },
  ];

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your career dashboard...</p>
        </div>
      </div>
    );
  }

  // Render Functions
  const renderHeader = () => {
    return (
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div className="flex items-center justify-between w-full lg:w-auto mb-4 lg:mb-0">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl flex items-center justify-center text-white font-bold text-xl overflow-hidden">
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
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Welcome back, <span className="bg-gradient-to-r from-green-600 to-blue-800 bg-clip-text text-transparent">{user?.name}</span>!
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  Ready to advance your career in South Africa? 🚀
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{profile?.profile?.location?.city || 'South Africa'}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Briefcase className="h-4 w-4" />
                <span>{stats.total} applications</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{stats.successRate}% success rate</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleMenuToggle}
            className="lg:hidden p-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        <div className="flex items-center space-x-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center space-x-2 bg-white rounded-xl border border-gray-200 p-1">
            <button 
              onClick={() => handleViewModeChange('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-green-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button 
              onClick={() => handleViewModeChange('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-green-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <div className="w-4 h-4 flex flex-col space-y-0.5">
                <div className="bg-current h-1 rounded-sm"></div>
                <div className="bg-current h-1 rounded-sm"></div>
                <div className="bg-current h-1 rounded-sm"></div>
              </div>
            </button>
          </div>
          
          <button 
            onClick={handleExportDashboardData}
            className="flex items-center space-x-2 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-green-600 hover:shadow-lg transition-all duration-300 group"
          >
            <Download className="h-4 w-4 text-gray-600 group-hover:text-green-600 transition-colors" />
            <span className="font-medium hidden sm:inline">Export</span>
          </button>
          <button 
            onClick={handleShareDashboardSummary}
            className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-800 text-white rounded-xl hover:from-blue-800 hover:to-green-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <Share2 className="h-4 w-4" />
            <span className="font-medium hidden sm:inline">Share</span>
          </button>
        </div>
      </div>
    );
  };

  const renderSidebar = () => {
    if (!isMenuOpen && window.innerWidth < 1024) return null;

    const careerStats = [
      { label: 'Total Applications', value: stats.total, color: 'text-green-600', icon: Briefcase },
      { label: 'Under Review', value: stats.reviewed, color: 'text-blue-600', icon: Eye },
      { label: 'Job Offers', value: stats.accepted, color: 'text-purple-600', icon: Award },
      { label: 'Success Rate', value: `${stats.successRate}%`, color: 'text-yellow-600', icon: Star },
    ];

    return (
      <div className="lg:col-span-1 space-y-6">
        {/* Profile Card */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg overflow-hidden">
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
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{user?.name}</h3>
            <p className="text-gray-600 text-sm capitalize mb-3">Active Job Seeker</p>
            
            {/* Profile Completion */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Profile Strength</span>
                <span className="text-green-600 font-semibold">{profileStrength}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-600 to-blue-800 h-2 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${profileStrength}%` }}
                ></div>
              </div>
              {profileStrength < 80 && (
                <p className="text-xs text-yellow-600 mt-1">
                  Complete your profile to get {100 - profileStrength}% more visibility
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 text-yellow-500 mr-2" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className="flex items-center space-x-3 p-3 rounded-xl hover:shadow-md transition-all duration-300 group bg-gradient-to-r from-white to-gray-50 hover:from-green-50 hover:to-blue-50 border border-gray-200 hover:border-green-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-800 group-hover:text-green-700 font-semibold text-sm">
                      {action.label}
                    </span>
                    {action.badge && (
                      <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs rounded-full font-medium">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-600">{action.description}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            ))}
          </div>
        </div>

        {/* Career Stats Summary */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            Career Snapshot
          </h3>
          <div className="space-y-4">
            {careerStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between group">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{stat.label}</span>
                </div>
                <span className={`font-bold text-lg ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
          <Link 
            to="/candidate/analytics"
            className="w-full mt-4 text-center bg-gradient-to-r from-green-600 to-blue-800 text-white py-3 rounded-xl hover:from-blue-800 hover:to-green-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg block font-semibold"
            onClick={() => setIsMenuOpen(false)}
          >
            View Detailed Analytics
          </Link>
        </div>
      </div>
    );
  };

  const renderCareerInsights = () => {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {careerInsights.map((insight, index) => (
          <div key={index} className="card p-4 lg:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${
                insight.trend === 'up' ? 'from-green-500 to-emerald-600' : 'from-blue-500 to-cyan-600'
              } flex items-center justify-center shadow-md`}>
                <insight.icon className="h-5 w-5 text-white" />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                insight.trend === 'up' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {insight.change}
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{insight.value}</div>
            <div className="text-sm font-medium text-gray-700 mb-1">{insight.title}</div>
            <div className="text-xs text-gray-500">{insight.description}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderApplications = () => {
    const filteredApplications = applications.filter(app => 
      activeTab === 'overview' || app.status === activeTab
    );

    return (
      <div className="card hover:shadow-xl transition-all duration-300">
        <div className="border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 lg:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 lg:mb-0">Your Applications</h2>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {applicationTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`flex items-center py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.key
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`ml-2 py-0.5 px-2 text-xs rounded-full ${
                        activeTab === tab.key
                          ? 'bg-green-600/10 text-green-600'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6">
          {filteredApplications.length > 0 ? (
            <div className={`space-y-4 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}`}>
              {filteredApplications.map((application) => (
                <div key={application._id} className={`group border border-gray-200 rounded-2xl hover:border-green-600/50 transition-all duration-300 hover:shadow-lg ${
                  viewMode === 'grid' ? 'p-4' : 'p-6'
                }`}>
                  <div className={`${viewMode === 'grid' ? 'flex flex-col h-full' : 'flex items-center justify-between'}`}>
                    <div className={`${viewMode === 'grid' ? 'flex-1' : 'flex items-center space-x-4 flex-1'}`}>
                      <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                            <Briefcase className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors truncate">
                            {application.job?.title}
                          </h3>
                          <p className="text-gray-600 text-sm truncate">{application.job?.company}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-500 mt-1">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span className="text-xs">
                                {application.job?.location ? 
                                  (typeof application.job.location === 'string' ? 
                                    application.job.location : 
                                    `${application.job.location.city}, ${application.job.location.province}`)
                                  : 'Location not specified'
                                }
                              </span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-xs">Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 justify-between sm:justify-end">
                      <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(application.status)} group-hover:shadow-md transition-all duration-300`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize text-sm">{application.status}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/jobs/${application.job?._id}`}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-600/10 rounded-lg transition-all duration-300"
                          title="View Job"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleMessageEmployer(application)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-600/10 rounded-lg transition-all duration-300"
                          title="Message Employer"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <Briefcase className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Start Your Job Hunt!
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto text-lg">
                Discover amazing opportunities across South Africa and take the next step in your career journey.
              </p>
              <Link
                to="/jobs"
                className="bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg inline-flex items-center space-x-2"
              >
                <Sparkles className="h-5 w-5" />
                <span>Explore Jobs in SA</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCareerInsightsAndRecommendations = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Career Insights */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Lightbulb className="h-6 w-6 text-blue-600" />
            <span>Career Insights</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-200">
              <div>
                <p className="font-semibold text-gray-900">Most Applied Industry</p>
                <p className="text-sm text-gray-600">Technology & IT Services</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">42%</p>
                <p className="text-xs text-gray-500">of applications</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-green-200">
              <div>
                <p className="font-semibold text-gray-900">Top Location</p>
                <p className="text-sm text-gray-600">Gauteng Province</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">58%</p>
                <p className="text-xs text-gray-500">preference</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-purple-200">
              <div>
                <p className="font-semibold text-gray-900">Skills in Demand</p>
                <p className="text-sm text-gray-600">React, Node.js, Python</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-purple-600">+15%</p>
                <p className="text-xs text-gray-500">growth</p>
              </div>
            </div>
          </div>
        </div>

        {/* Perfect Matches with Bookmark and Share */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <TargetIcon className="h-6 w-6 text-green-600" />
              <span>Perfect Matches</span>
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Sparkles className="h-4 w-4 text-green-500" />
              <span>Curated for you</span>
            </div>
          </div>
          <div className="space-y-4">
            {perfectMatches.map((job) => (
              <div key={job.id} className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-green-600 hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        {job.title}
                      </h4>
                      {job.urgent && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          Urgent
                        </span>
                      )}
                      {job.featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{job.company}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{job.location}</span>
                      </span>
                      <span>•</span>
                      <span>{job.type}</span>
                      <span>•</span>
                      <span>{job.salary}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-gradient-to-r from-green-600 to-blue-800 text-white text-sm font-bold py-1 px-3 rounded-full mb-2">
                      {job.match}%
                    </div>
                    <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                      Apply Now
                    </button>
                  </div>
                </div>
                
                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {job.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-2 py-1 rounded-lg text-xs font-semibold border border-gray-300/50"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className="inline-block bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-2 py-1 rounded-lg text-xs font-semibold">
                      +{job.skills.length - 3} more
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleBookmarkJob(job.id)}
                      className={`p-1 transition-colors duration-300 ${
                        job.isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                      }`}
                      title={job.isBookmarked ? 'Remove from saved' : 'Save job'}
                    >
                      <Bookmark className={`h-4 w-4 ${job.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                      onClick={() => handleShareJob(job)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-300"
                      title="Share job"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/jobs"
            className="w-full mt-4 text-center bg-gradient-to-r from-green-600 to-blue-800 text-white py-3 rounded-xl hover:from-blue-800 hover:to-green-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg block font-semibold"
          >
            View All Recommendations
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderHeader()}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {renderSidebar()}

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {renderCareerInsights()}
            {renderApplications()}
            {renderCareerInsightsAndRecommendations()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;