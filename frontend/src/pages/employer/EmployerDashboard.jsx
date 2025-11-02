import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiClient, employerAPI, jobsAPI, analyticsAPI } from '../../api/apiClient.js'; 
import { 
  Plus, Briefcase, Users, Eye, TrendingUp, DollarSign, Clock, 
  Building, MapPin, Target, Award, Zap, BarChart3, MessageSquare,
  CheckCircle, XCircle, Clock4, Filter, Download, Share2, FileText,
  Search, Star, Mail, RefreshCw, Menu, X, Sparkles, ArrowUpRight,
  UserCheck, Calendar, TrendingDown, Circle, ExternalLink
} from 'lucide-react';
import { showToast } from '../../utils/toast.js';
import getImageUrl from '../../utils/imageUrl';

// Constants
const quickActions = [
  {
    icon: Plus,
    label: 'Post New Job',
    description: 'Create a new job listing',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
    hoverColor: 'hover:from-green-600 hover:to-emerald-700',
    href: '/employer/jobs/new'
  },
  {
    icon: Users,
    label: 'Find Candidates',
    description: 'Browse potential candidates',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-600',
    hoverColor: 'hover:from-blue-600 hover:to-cyan-700',
    href: '/employer/candidates'
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    description: 'View performance insights',
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-gradient-to-r from-purple-500 to-indigo-600',
    hoverColor: 'hover:from-purple-600 hover:to-indigo-700',
    href: '/employer/analytics'
  },
  {
    icon: Building,
    label: 'Company Profile',
    description: 'Update company information',
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-gradient-to-r from-orange-500 to-red-600',
    hoverColor: 'hover:from-orange-600 hover:to-red-700',
    href: '/employer/profile'
  },
  {
    icon: FileText,
    label: 'All Applications',
    description: 'View all job applications',
    color: 'from-red-500 to-pink-600',
    bgColor: 'bg-gradient-to-r from-red-500 to-pink-600',
    hoverColor: 'hover:from-red-600 hover:to-pink-700',
    href: '/employer/applications'
  },
  {
    icon: MessageSquare,
    label: 'Messages',
    description: 'Check your conversations',
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-gradient-to-r from-indigo-500 to-purple-600',
    hoverColor: 'hover:from-indigo-600 hover:to-purple-700',
    href: '/messages'
  }
];

// Main Component
const EmployerDashboard = () => {
  // Hooks and State
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    conversionRate: 0,
    avgResponseTime: 0
  });
  
  const [currentJobs, setCurrentJobs] = useState([]);
  const [potentialCandidates, setPotentialCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Effects
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Data Processing Functions
  const getApplicationStatusCounts = () => {
    if (!analyticsData?.applicationStats) return null;
    
    return {
      pending: analyticsData.applicationStats.pending || 0,
      reviewed: analyticsData.applicationStats.reviewed || 0,
      accepted: analyticsData.applicationStats.accepted || 0,
      rejected: analyticsData.applicationStats.rejected || 0
    };
  };

  // API Functions
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, jobsResponse, candidatesResponse, analyticsResponse] = await Promise.all([
        employerAPI.getStats(),
        employerAPI.getCurrentJobs(),
        employerAPI.getPotentialCandidates(),
        analyticsAPI.getEmployerAnalytics()
      ]);

      console.log('Candidates API response:', candidatesResponse.data);
      if (candidatesResponse.data.candidates && candidatesResponse.data.candidates.length > 0) {
        console.log('First candidate structure:', candidatesResponse.data.candidates[0]);
      }

      if (analyticsResponse.data.success) {
        const analytics = analyticsResponse.data.analytics;
        setAnalyticsData(analytics);
        
        setStats({
          totalJobs: analytics.overview.totalJobs || 0,
          activeJobs: analytics.overview.activeJobs || 0,
          totalApplications: analytics.overview.totalApplications || 0,
          pendingApplications: analytics.overview.pendingApplications || analytics.applicationStats?.pending || 0,
          conversionRate: analytics.overview.overallConversionRate || 0,
          avgResponseTime: analytics.overview.avgResponseTime || analytics.employerStats?.avgResponseTime || 0
        });
      } else {
        setStats(statsResponse.data.stats || {});
      }

      setCurrentJobs(jobsResponse.data.jobs || []);
      setPotentialCandidates(candidatesResponse.data.candidates || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Event Handlers
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const exportDashboardData = () => {
    try {
      const dashboardData = {
        exportedAt: new Date().toISOString(),
        overview: stats,
        currentJobs: currentJobs.map(job => ({
          title: job.title,
          company: job.company,
          status: job.status,
          applications: job.stats?.applications || 0,
          views: job.stats?.views || 0
        })),
        potentialCandidates: potentialCandidates.map(candidate => ({
          name: candidate.name,
          matchScore: candidate.matchScore,
          skills: candidate.skills,
          headline: candidate.profile?.headline
        })),
        analytics: analyticsData
      };

      const blob = new Blob([JSON.stringify(dashboardData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employer-dashboard-${new Date().toISOString().split('T')[0]}.json`;
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

  const shareDashboard = async () => {
    try {
      const statusCounts = getApplicationStatusCounts();
      const summary = `Employer Dashboard Summary:
• Total Jobs: ${stats.totalJobs}
• Active Jobs: ${stats.activeJobs}
• Total Applications: ${stats.totalApplications}
• Conversion Rate: ${stats.conversionRate}%
• Top Candidates: ${potentialCandidates.slice(0, 3).map(c => c.name).join(', ')}
      `;

      if (navigator.share) {
        await navigator.share({
          title: 'My Employer Dashboard Summary',
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

  const viewCandidateProfile = (candidateId) => {
    if (!candidateId) {
      showToast('Candidate ID not found', 'error');
      return;
    }
    navigate(`/employer/candidates/${candidateId}`);
  };

  const contactCandidate = (candidate) => {
    if (!candidate) {
      showToast('Candidate information is missing', 'error');
      return;
    }

    // Try various possible ID locations
    const candidateId = 
      candidate._id || 
      candidate.id || 
      candidate.userId ||
      candidate.user?._id ||
      candidate.user?.id;
    
    const candidateName = 
      candidate.name || 
      candidate.user?.name || 
      'Candidate';
    
    const candidateEmail = 
      candidate.email || 
      candidate.user?.email;

    console.log('Contact candidate - Resolved IDs:', {
      candidateId,
      candidateName, 
      candidateEmail,
      rawCandidate: candidate
    });
    
    if (!candidateId) {
      showToast('Cannot contact candidate: ID not found', 'error');
      return;
    }
    
    navigate('/messages', { 
      state: { 
        startNewChat: true,
        recipientId: candidateId,
        recipientName: candidateName,
        recipientEmail: candidateEmail
      }
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing your insights</p>
        </div>
      </div>
    );
  }

  // Render Functions
  const renderMetrics = () => {
    const statusCounts = getApplicationStatusCounts();
    
    const metrics = [
      {
        label: 'Active Jobs',
        value: stats.activeJobs,
        subtitle: `${stats.totalJobs > 0 ? `${Math.round((stats.activeJobs / stats.totalJobs) * 100)}% of total` : 'No jobs'}`,
        icon: Briefcase,
        color: 'green',
        trend: 'up'
      },
      {
        label: 'Total Applications',
        value: stats.totalApplications,
        subtitle: statusCounts ? `${statusCounts.accepted} accepted • ${statusCounts.reviewed} reviewed` : 'Track applications',
        icon: Users,
        color: 'blue',
        trend: 'up'
      },
      {
        label: 'Conversion Rate',
        value: `${stats.conversionRate}%`,
        subtitle: stats.conversionRate >= 15 ? 'Above average' : 'Needs improvement',
        icon: TrendingUp,
        color: 'purple',
        trend: stats.conversionRate >= 15 ? 'up' : 'down'
      },
      {
        label: 'Avg Response Time',
        value: `${stats.avgResponseTime}d`,
        subtitle: stats.avgResponseTime <= 2 ? 'Good pace' : 'Can improve',
        icon: Clock,
        color: 'orange',
        trend: stats.avgResponseTime <= 2 ? 'down' : 'up'
      }
    ];

    return metrics.map((metric, index) => (
      <div key={index} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{metric.label}</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">{metric.value}</p>
              <div className="flex items-center space-x-1 mt-2">
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <p className={`text-xs font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.subtitle}
                </p>
              </div>
            </div>
            <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r ${
              metric.color === 'green' ? 'from-green-500 to-emerald-600' :
              metric.color === 'blue' ? 'from-blue-500 to-cyan-600' :
              metric.color === 'purple' ? 'from-purple-500 to-indigo-600' :
              'from-orange-500 to-red-600'
            } rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              <metric.icon className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const renderApplicationStatus = () => {
    const statusCounts = getApplicationStatusCounts();
    if (!statusCounts) return null;
    
    const statusItems = [
      { label: 'Pending', count: statusCounts.pending, color: 'yellow', icon: Clock4 },
      { label: 'Reviewed', count: statusCounts.reviewed, color: 'blue', icon: Eye },
      { label: 'Accepted', count: statusCounts.accepted, color: 'green', icon: CheckCircle },
      { label: 'Rejected', count: statusCounts.rejected, color: 'red', icon: XCircle }
    ];

    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-8 hover:shadow-xl transition-all duration-300">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span>Application Status Overview</span>
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statusItems.map((status, index) => (
            <div 
              key={index}
              className="group text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-r ${
                status.color === 'yellow' ? 'from-yellow-400 to-orange-500' :
                status.color === 'blue' ? 'from-blue-400 to-cyan-500' :
                status.color === 'green' ? 'from-green-400 to-emerald-500' :
                'from-red-400 to-pink-500'
              } rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <status.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{status.count}</div>
              <div className={`text-sm font-semibold ${
                status.color === 'yellow' ? 'text-yellow-700' :
                status.color === 'blue' ? 'text-blue-700' :
                status.color === 'green' ? 'text-green-700' :
                'text-red-700'
              }`}>
                {status.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQuickActions = () => {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span>Quick Actions</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
              <div className="relative flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-green-600 hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1 group-hover:scale-105">
                <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 group-hover:text-green-600 text-base truncate transition-colors duration-200">
                    {action.label}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">{action.description}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const renderCurrentJobs = () => {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span>Current Job Postings</span>
          </h2>
          <Link 
            to="/employer/all-applications" 
            className="group flex items-center space-x-2 text-green-600 hover:text-green-700 font-semibold transition-colors duration-200"
          >
            <span>View All Jobs</span>
            <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
          </Link>
        </div>
        
        <div className="space-y-4">
          {currentJobs.length > 0 ? (
            currentJobs.map((job) => (
              <div key={job._id} className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-green-600 hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-0.5 gap-4">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-lg group-hover:text-green-600 transition-colors duration-200 truncate">
                        {job.title}
                      </h4>
                      <p className="text-gray-600 text-sm font-medium truncate">{job.company}</p>
                      <div className="flex items-center flex-wrap gap-3 text-sm text-gray-500 mt-2">
                        <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-lg">
                          <MapPin className="h-3 w-3" />
                          <span className="font-medium truncate">{job.location?.city}, {job.location?.province}</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-lg">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium">{job.type}</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-lg">
                          <Users className="h-3 w-3 text-blue-600" />
                          <span className="font-medium text-blue-600">{job.stats?.applications || 0} applications</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 self-end sm:self-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      job.status === 'active' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                    }`}>
                      {job.status}
                    </span>
                    <Link
                      to={`/jobs/${job._id}`}
                      className="group p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 shadow-lg"
                      title="View Job"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        const jobUrl = `${window.location.origin}/jobs/${job._id}`;
                        navigator.clipboard.writeText(jobUrl);
                        showToast('Job link copied to clipboard!', 'success');
                      }}
                      className="group p-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-110 shadow-lg"
                      title="Share Job"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No active jobs</h3>
              <p className="text-gray-600 mb-6">Post your first job to start attracting candidates.</p>
              <Link
                to="/employer/jobs/new"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Post Your First Job</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPotentialCandidates = () => {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <span>Top Candidates</span>
          </h2>
          <Link 
            to="/employer/candidates" 
            className="group flex items-center space-x-2 text-green-600 hover:text-green-700 font-semibold transition-colors duration-200"
          >
            <span>View All</span>
            <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
          </Link>
        </div>
        
        <div className="space-y-4">
          {potentialCandidates.slice(0, 3).map((candidate) => (
            <div key={candidate._id || candidate.id} className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
              <div className="relative p-4 bg-white border border-gray-200 rounded-xl hover:border-green-600 hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-0.5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300 shadow-lg overflow-hidden">
                      {getImageUrl(candidate.profileImage || candidate.profile?.avatar) ? (
                        <img 
                          src={getImageUrl(candidate.profileImage || candidate.profile?.avatar)} 
                          alt={candidate.name} 
                          className="w-full h-full rounded-xl object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full rounded-xl flex items-center justify-center ${getImageUrl(candidate.profileImage || candidate.profile?.avatar) ? 'hidden' : 'flex'}`}
                      >
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-lg group-hover:text-green-600 transition-colors duration-200 truncate">
                        {candidate.name}
                      </h4>
                      <p className="text-gray-600 text-sm font-medium truncate">
                        {candidate.profile?.headline || 'Skilled Professional'}
                      </p>
                    </div>
                  </div>
                  {candidate.isGoodMatch && (
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      <Star className="h-3 w-3 fill-current" />
                      <span>Top Match</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-700">Match Score:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      candidate.matchScore >= 80 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                        : candidate.matchScore >= 60 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                        : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                    } shadow-lg`}>
                      {candidate.matchScore}%
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {candidate.skills?.slice(0, 3).map((skill, skillIndex) => {
                    const skillName = typeof skill === 'string' 
                      ? skill 
                      : (skill?.name || skill?.skill || 'Unknown Skill');
                    
                    return (
                      <span
                        key={skillIndex}
                        className="inline-block bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold border border-gray-300/50 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 truncate max-w-[120px]"
                        title={skillName}
                      >
                        {skillName}
                      </span>
                    );
                  })}
                  {candidate.skills?.length > 3 && (
                    <span className="inline-block bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold">
                      +{candidate.skills.length - 3} more
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewCandidateProfile(candidate._id || candidate.id)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg font-semibold text-sm"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => contactCandidate(candidate)}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg font-semibold text-sm"
                    title="Contact Candidate"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg blur opacity-25"></div>
                <div className="relative">
                  <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Employer Dashboard
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="group flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-xl hover:border-green-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                <span className="font-medium">Refresh</span>
              </button>
              <button 
                onClick={exportDashboardData}
                className="group flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-xl hover:border-green-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Download className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="font-medium">Export</span>
              </button>
              <button 
                onClick={shareDashboard}
                className="group flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-800 text-white rounded-xl hover:from-blue-800 hover:to-green-600 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Share2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="font-medium">Share</span>
              </button>
            </div>
          </div>
          <p className="text-gray-600 mt-3 text-lg max-w-2xl">
            Welcome back, <span className="font-semibold text-green-600">{user?.name}</span>! Here's what's happening with your jobs and candidates.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {renderMetrics()}
        </div>

        {/* Application Status Overview */}
        {renderApplicationStatus()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {renderQuickActions()}
            {renderCurrentJobs()}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {renderPotentialCandidates()}

            {/* Data Consistency Notice */}
            <div className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
                <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <span>Real-time Analytics</span>
                </h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  All metrics are synchronized between your dashboard and analytics. 
                  Data updates in real-time for accurate decision making.
                </p>
                <div className="flex items-center space-x-2 text-blue-700 mt-4">
                  <div className="flex items-center space-x-1">
                    <Circle className="h-2 w-2 fill-green-500 animate-pulse" />
                    <span className="text-xs font-semibold">Live</span>
                  </div>
                  <span className="text-xs">•</span>
                  <div className="flex items-center space-x-1 text-xs">
                    <RefreshCw className="h-3 w-3" />
                    <span>Last updated: Just now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;