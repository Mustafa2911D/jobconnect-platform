import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { jobsAPI } from '../../api/apiClient.js';
import { 
  Search, Filter, Edit, Trash2, Eye, Plus, Briefcase, 
  MapPin, DollarSign, Clock, Users, CheckCircle, XCircle,
  Menu, X, TrendingUp, BarChart3, Zap, Sparkles, Target,
  ArrowUpRight, RefreshCw, Building, Calendar, FileText,
  AlertTriangle, Check, Info
} from 'lucide-react';
import { showToast } from '../../utils/toast.js';
import getImageUrl from '../../utils/imageUrl';

const MyJobPosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State Management
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    applications: 0,
    views: 0
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-white" />;
      case 'closed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'paused': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Briefcase className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg';
      case 'closed': return 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg';
      case 'paused': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg';
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Salary not specified';
    if (salary.min && salary.max) return `R ${salary.min.toLocaleString()} - R ${salary.max.toLocaleString()}`;
    if (salary.min) return `From R ${salary.min.toLocaleString()}`;
    if (salary.max) return `Up to R ${salary.max.toLocaleString()}`;
    return 'Salary not specified';
  };

  // Data Fetching
  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getEmployerJobs();
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      showToast('Error fetching your job posts', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMyJobs();
  };

  // Filtering and Stats
  const filterJobs = () => {
    let filtered = jobs;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(job => job.status === selectedStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.company?.toLowerCase().includes(term)
      );
    }

    setFilteredJobs(filtered);
  };

  const updateStats = () => {
    const stats = {
      total: jobs.length,
      active: jobs.filter(job => job.status === 'active').length,
      applications: jobs.reduce((sum, job) => sum + (job.stats?.applications || 0), 0),
      views: jobs.reduce((sum, job) => sum + (job.stats?.views || 0), 0)
    };
    setStats(stats);
  };

  // Job Deletion
  const handleDeleteClick = (jobId) => {
    setJobToDelete(jobId);
    setShowDeleteModal(true);
  };

  const deleteJob = async () => {
    if (!jobToDelete) return;

    try {
      console.log('🔄 Starting delete job process...');
      
      if (!user) {
        showToast('Please log in to delete jobs', 'error');
        navigate('/login');
        return;
      }

      if (user.role !== 'employer') {
        showToast('Only employers can delete job posts', 'error');
        return;
      }

      await jobsAPI.deleteJob(jobToDelete);
      
      console.log('✅ Job deleted successfully, showing toast...');
      showToast('🗑️ Job deleted successfully', 'success');
      
      setShowDeleteModal(false);
      setJobToDelete(null);
      fetchMyJobs();
      
    } catch (error) {
      console.error('❌ Error deleting job:', error);
      
      setShowDeleteModal(false);
      setJobToDelete(null);
      
      if (error.response?.status === 403) {
        showToast('You are not authorized to delete this job', 'error');
      } else if (error.response?.status === 401) {
        showToast('Please log in again', 'error');
        navigate('/login');
      } else {
        showToast('Error deleting job', 'error');
      }
    }
  };

  // Effects
  useEffect(() => {
    fetchMyJobs();
  }, []);

  useEffect(() => {
    filterJobs();
    updateStats();
  }, [jobs, searchTerm, selectedStatus]);

  // Confirmation Modal Component
  const ConfirmationModal = () => {
    if (!showDeleteModal) return null;

    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
        <div className="bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 max-w-md w-full mx-4 border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Job Post</h3>
            </div>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setJobToDelete(null);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-gray-600 text-lg leading-relaxed">
              Are you sure you want to delete this job post? This action cannot be undone and all applications for this job will also be deleted.
            </p>
          </div>

          {/* Footer */}
          <div className="flex space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setJobToDelete(null);
              }}
              className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-105"
            >
              Keep Job
            </button>
            <button
              onClick={deleteJob}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>Delete Job</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your job posts...</p>
          <p className="text-gray-500 text-sm mt-2">Getting everything organized</p>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg blur opacity-25"></div>
              <div className="relative">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  My Job Posts
                </h1>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="group flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-xl hover:border-green-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span className="font-medium">Refresh</span>
            </button>
            <Link
              to="/employer/jobs/new"
              className="group flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="font-medium">Post New Job</span>
            </Link>
          </div>
        </div>

        <p className="text-gray-600 text-lg mb-8 max-w-3xl">
          Manage your active job listings, track performance metrics, and attract top talent
        </p>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Jobs', value: stats.total, color: 'from-blue-500 to-cyan-600', icon: Briefcase },
            { label: 'Active Posts', value: stats.active, color: 'from-green-500 to-emerald-600', icon: CheckCircle },
            { label: 'Total Applications', value: stats.applications, color: 'from-purple-500 to-indigo-600', icon: Users },
            { label: 'Total Views', value: stats.views, color: 'from-orange-500 to-red-600', icon: TrendingUp }
          ].map((stat, index) => (
            <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 mb-8">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Search className="h-4 w-4 text-gray-400 transition-colors group-hover:text-green-600" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by job title, description, or company..."
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400"
                  />
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="relative px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 md:w-48"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span>
                Your Job Posts 
                <span className="text-lg font-normal text-gray-500 ml-2">
                  ({filteredJobs.length})
                </span>
              </span>
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2 lg:mt-0">
              <Sparkles className="h-4 w-4 text-green-500" />
              <span>Real-time performance tracking</span>
            </div>
          </div>

          <div className="space-y-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div 
                  key={job._id} 
                  className="group relative overflow-hidden"
                  onMouseEnter={() => setHoveredCard(job._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
                  <div className={`relative bg-white border rounded-2xl p-6 transition-all duration-300 transform ${
                    hoveredCard === job._id ? '-translate-y-2 shadow-2xl border-green-600' : 'border-gray-200 shadow-lg'
                  }`}>
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* Job Info */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                                {job.title}
                              </h3>
                              <div className={`inline-flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(job.status)} transform transition-transform duration-300 ${
                                hoveredCard === job._id ? 'scale-105' : ''
                              }`}>
                                {getStatusIcon(job.status)}
                                <span className="ml-1 capitalize">{job.status}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-4 mb-4">
                              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-xl">
                                <Building className="h-4 w-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">{job.company}</span>
                              </div>
                              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-xl">
                                <MapPin className="h-4 w-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">{job.location?.city}, {job.location?.province}</span>
                              </div>
                              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-xl">
                                <DollarSign className="h-4 w-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">{formatSalary(job.salary)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 line-clamp-2 mb-6 text-lg leading-relaxed">
                          {job.description && job.description.length > 200 
                            ? `${job.description.substring(0, 200)}...` 
                            : job.description
                          }
                        </p>

                        {/* Job Stats */}
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-xl">
                            <Eye className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-blue-700">{job.stats?.views || 0} views</span>
                          </div>
                          <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-xl">
                            <Users className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-700">{job.stats?.applications || 0} applications</span>
                          </div>
                          <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-xl">
                            <Calendar className="h-4 w-4 text-purple-600" />
                            <span className="font-semibold text-purple-700">
                              Posted {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {job.type && (
                            <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-xl">
                              <Clock className="h-4 w-4 text-orange-600" />
                              <span className="font-semibold text-orange-700">{job.type}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-3 min-w-[280px]">
                        <Link
                          to={`/employer/jobs/edit/${job._id}`}
                          className="group/edit flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          <Edit className="h-4 w-4 transition-transform group-hover/edit:scale-110" />
                          <span className="font-semibold">Edit Job</span>
                        </Link>
                        
                        <Link
                          to={`/employer/applications?job=${job._id}`}
                          className="group/applications flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          <FileText className="h-4 w-4 transition-transform group-hover/applications:scale-110" />
                          <span className="font-semibold">View Applications</span>
                        </Link>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            to={`/jobs/${job._id}`}
                            className="group/view flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg text-sm font-semibold"
                          >
                            <Eye className="h-4 w-4 transition-transform group-hover/view:scale-110" />
                            <span>Preview</span>
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(job._id)}
                            className="group/delete flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg text-sm font-semibold"
                          >
                            <Trash2 className="h-4 w-4 transition-transform group-hover/delete:scale-110" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <Briefcase className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No job posts found</h3>
                <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                  {jobs.length === 0 
                    ? "You haven't posted any jobs yet. Create your first job post to start attracting talent." 
                    : "No job posts match your current filters. Try adjusting your search criteria."}
                </p>
                <Link
                  to="/employer/jobs/new"
                  className="group inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Plus className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span>Post Your First Job</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Performance Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200/50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-900 mb-3">Boost Your Job Post Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl backdrop-blur-sm">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <span className="text-blue-800 font-medium">Use Clear Job Titles</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl backdrop-blur-sm">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <span className="text-blue-800 font-medium">Include Salary Ranges</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl backdrop-blur-sm">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span className="text-blue-800 font-medium">Add Company Benefits</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal />
      </div>
    </div>
  );
};

export default MyJobPosts;