import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { savedJobsAPI } from '../api/apiClient.js';
import JobCard from '../components/JobCard.jsx';
import { 
  Bookmark, Search, Filter, Trash2, FileText, Download, 
  Share2, MapPin, Briefcase, DollarSign, Calendar,
  ArrowLeft, Eye, Users, Zap, Sparkles, X,
  CheckCircle, AlertCircle, Clock, RotateCw
} from 'lucide-react';
import { showToast } from '../utils/toast.js';

const SavedJobs = () => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Constants
  const stats = [
    { 
      label: 'Total Saved', 
      value: savedJobs.length, 
      icon: Bookmark, 
      gradient: 'from-green-500 to-emerald-600',
      bg: 'from-green-50 to-emerald-100'
    },
    { 
      label: 'Active Jobs', 
      value: savedJobs.filter(job => job.status === 'active').length, 
      icon: Eye, 
      gradient: 'from-blue-500 to-cyan-600',
      bg: 'from-blue-50 to-cyan-100'
    },
    { 
      label: 'This Month', 
      value: savedJobs.filter(job => {
        const savedDate = new Date(job.savedAt);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return savedDate > monthAgo;
      }).length, 
      icon: Calendar, 
      gradient: 'from-purple-500 to-indigo-600',
      bg: 'from-purple-50 to-indigo-100'
    },
    { 
      label: 'Applications', 
      value: savedJobs.filter(job => job.hasApplied).length, 
      icon: FileText, 
      gradient: 'from-orange-500 to-red-600',
      bg: 'from-orange-50 to-red-100'
    }
  ];

  // Effects
  useEffect(() => {
    fetchSavedJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [savedJobs, searchTerm, selectedStatus]);

  // API Functions
  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await savedJobsAPI.getSavedJobs();
      setSavedJobs(response.data.savedJobs || []);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      showToast('Error loading saved jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshSavedJobs = async () => {
    try {
      setIsRefreshing(true);
      await fetchSavedJobs();
      showToast('Saved jobs refreshed!', 'success');
    } finally {
      setIsRefreshing(false);
    }
  };

  const removeSavedJob = async (jobId) => {
    try {
      await savedJobsAPI.removeSavedJob(jobId);
      setSavedJobs(prev => prev.filter(job => job._id !== jobId));
      showToast('Job removed from saved jobs', 'success');
    } catch (error) {
      console.error('Error removing saved job:', error);
      showToast('Error removing job', 'error');
    }
  };

  // Utility Functions
  const filterJobs = () => {
    let filtered = savedJobs;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(term) ||
        job.company?.toLowerCase().includes(term) ||
        job.description?.toLowerCase().includes(term)
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(job => job.status === selectedStatus);
    }

    setFilteredJobs(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
  };

  const exportSavedJobs = () => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        totalJobs: savedJobs.length,
        jobs: savedJobs.map(job => ({
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type,
          salary: job.salary,
          savedAt: job.savedAt,
          url: `${window.location.origin}/jobs/${job._id}`
        }))
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `saved-jobs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Saved jobs exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting saved jobs:', error);
      showToast('Error exporting saved jobs', 'error');
    }
  };

  const shareSavedJobs = async () => {
    try {
      const jobList = savedJobs.map(job => `• ${job.title} at ${job.company}`).join('\n');
      const text = `My Saved Jobs (${savedJobs.length}):\n\n${jobList}`;

      if (navigator.share) {
        await navigator.share({
          title: 'My Saved Jobs',
          text: text
        });
      } else {
        await navigator.clipboard.writeText(text);
        showToast('Job list copied to clipboard!', 'success');
      }
    } catch (error) {
      console.error('Error sharing saved jobs:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed': return <X className="h-4 w-4 text-red-500" />;
      case 'draft': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-200 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-4 border-green-500 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-600 text-lg mt-4 font-medium">Loading your saved jobs...</p>
          <p className="text-gray-400 text-sm mt-2">Curating your opportunities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <Link
              to="/jobs"
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-all duration-300 group bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl hover:shadow-lg border border-transparent hover:border-green-200"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Jobs</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="relative">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Saved Jobs
              </h1>
              <p className="text-gray-600 mt-2 flex items-center space-x-1">
                <Sparkles className="h-4 w-4 text-green-500" />
                <span>Your curated collection of interesting opportunities</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={refreshSavedJobs}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <RotateCw className={`h-4 w-4 transition-transform ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              onClick={exportSavedJobs}
              disabled={savedJobs.length === 0}
              className="flex items-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:border-green-600 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              <span>Export</span>
            </button>
            <button
              onClick={shareSavedJobs}
              disabled={savedJobs.length === 0}
              className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-800 text-white rounded-xl hover:from-blue-800 hover:to-green-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <Share2 className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className={`w-12 h-1 bg-gradient-to-r ${stat.gradient} rounded-full mt-2 group-hover:w-16 transition-all duration-300`}></div>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-8 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Search className="h-4 w-4 text-gray-400 transition-colors group-hover:text-green-600" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, company, or description..."
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="relative group flex-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="relative w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                {(searchTerm || selectedStatus !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-2 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-300 bg-white border border-gray-300 rounded-xl hover:border-gray-400"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        {savedJobs.length > 0 ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 p-4 bg-white/50 rounded-xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Your Saved Jobs <span className="text-green-600">({filteredJobs.length})</span>
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {filteredJobs.length === savedJobs.length 
                    ? 'All your saved opportunities' 
                    : `Filtered from ${savedJobs.length} total jobs`}
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2 sm:mt-0">
                <Sparkles className="h-4 w-4 text-green-500 animate-pulse" />
                <span>Personalized collection • Updated just now</span>
              </div>
            </div>

            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <div key={job._id} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative">
                      <JobCard job={job} />
                      <button
                        onClick={() => removeSavedJob(job._id)}
                        className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-xl text-red-600 hover:bg-red-50 hover:shadow-lg transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100 border border-red-200 hover:border-red-300"
                        title="Remove from saved jobs"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {job.status && (
                        <div className="absolute top-4 left-4 flex items-center space-x-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium">
                          {getStatusIcon(job.status)}
                          <span className="capitalize">{job.status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-inner">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No matching jobs found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                  We couldn't find any saved jobs matching your current filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg inline-flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Clear all filters</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-20 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl flex items-center justify-center shadow-lg">
              <Bookmark className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No saved jobs yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Start building your collection of dream jobs by saving interesting opportunities as you browse.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/jobs"
                className="bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl inline-flex items-center space-x-2 group"
              >
                <Zap className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span>Explore Jobs</span>
              </Link>
              <button
                onClick={refreshSavedJobs}
                className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl inline-flex items-center space-x-2 group"
              >
                <RotateCw className={`h-5 w-5 transition-transform ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;