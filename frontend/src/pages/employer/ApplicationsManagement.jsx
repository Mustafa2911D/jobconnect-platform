import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { employerAPI, applicationsAPI } from '../../api/apiClient.js';
import { 
  Search, Filter, Download, Mail, Phone, FileText, 
  CheckCircle, XCircle, Clock, Eye, User, Info,
  MessageCircle, ArrowUpRight, Sparkles, TrendingUp,
  Users, BarChart3, RefreshCw, Zap, Target, Award,
  Share2, Bookmark, ExternalLink
} from 'lucide-react';
import { showToast } from '../../utils/toast.js';

const ApplicationsManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State Management
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedApplications, setSelectedApplications] = useState(new Set());
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    accepted: 0,
    rejected: 0
  });

  // Helper Functions
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  
  // Use production backend URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://jobconnect-backend-yyho.onrender.com';
  
  if (imagePath.startsWith('uploads/')) {
    return `${baseUrl}/${imagePath}`;
  }
  
  return `${baseUrl}/uploads/profile-images/${imagePath}`;
};

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-5 w-5 text-white" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-white" />;
      case 'reviewed': return <Eye className="h-5 w-5 text-white" />;
      default: return <Clock className="h-5 w-5 text-white" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg';
      case 'rejected': return 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg';
      case 'reviewed': return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg';
      default: return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg';
    }
  };

  // API Functions
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await employerAPI.getApplications();
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      showToast('Error fetching applications', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await applicationsAPI.updateApplicationStatus(applicationId, status);
      showToast(`🎉 Application ${status} successfully`, 'success');
      
      setApplications(prev => prev.map(app => 
        app._id === applicationId ? { ...app, status } : app
      ));
    } catch (error) {
      console.error('Error updating application status:', error);
      showToast('Error updating application status', 'error');
    }
  };

  // Data Processing Functions
  const filterApplications = () => {
    let filtered = applications;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.candidate?.name?.toLowerCase().includes(term) ||
        app.job?.title?.toLowerCase().includes(term) ||
        app.candidate?.email?.toLowerCase().includes(term)
      );
    }

    setFilteredApplications(filtered);
  };

  const updateStats = () => {
    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      reviewed: applications.filter(app => app.status === 'reviewed').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
    setStats(stats);
  };

  // Selection Management
  const toggleApplicationSelection = (applicationId) => {
    setSelectedApplications(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(applicationId)) {
        newSelection.delete(applicationId);
      } else {
        newSelection.add(applicationId);
      }
      return newSelection;
    });
  };

  const selectAllApplications = () => {
    if (selectedApplications.size === filteredApplications.length) {
      setSelectedApplications(new Set());
    } else {
      setSelectedApplications(new Set(filteredApplications.map(app => app._id)));
    }
  };

  // Export Functions
  const exportApplications = () => {
    try {
      const applicationsToExport = selectedApplications.size > 0 
        ? applications.filter(app => selectedApplications.has(app._id))
        : filteredApplications;

      const exportData = {
        exportedAt: new Date().toISOString(),
        totalApplications: applicationsToExport.length,
        applications: applicationsToExport.map(app => ({
          candidate: {
            name: app.candidate?.name,
            email: app.candidate?.email,
            phone: app.candidate?.phone
          },
          job: {
            title: app.job?.title,
            company: app.job?.company
          },
          application: {
            status: app.status,
            appliedDate: app.createdAt,
            coverLetter: app.coverLetter?.substring(0, 200) + '...'
          },
          notes: app.notes || ''
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applications-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`Exported ${applicationsToExport.length} applications successfully!`, 'success');
    } catch (error) {
      console.error('Error exporting applications:', error);
      showToast('Error exporting applications', 'error');
    }
  };

  const exportApplicationsCSV = () => {
    try {
      const applicationsToExport = selectedApplications.size > 0 
        ? applications.filter(app => selectedApplications.has(app._id))
        : filteredApplications;

      const headers = ['Candidate Name', 'Candidate Email', 'Job Title', 'Company', 'Status', 'Applied Date'];
      const csvData = applicationsToExport.map(app => [
        `"${app.candidate?.name || 'N/A'}"`,
        `"${app.candidate?.email || 'N/A'}"`,
        `"${app.job?.title || 'N/A'}"`,
        `"${app.job?.company || 'N/A'}"`,
        `"${app.status}"`,
        `"${new Date(app.createdAt).toLocaleDateString()}"`
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`Exported ${applicationsToExport.length} applications as CSV!`, 'success');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showToast('Error exporting applications', 'error');
    }
  };

  // Action Handlers
  const handleRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const downloadResume = (resumeUrl) => {
  try {
    console.log('📄 Original resume URL from database:', resumeUrl);
    
    let resumeFilename;
    if (resumeUrl.includes('\\')) {
      resumeFilename = resumeUrl.split('\\').pop();
    } else if (resumeUrl.includes('/')) {
      resumeFilename = resumeUrl.split('/').pop();
    } else {
      resumeFilename = resumeUrl;
    }
    
    console.log('🔧 Extracted filename:', resumeFilename);
    
    // Use production backend URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://jobconnect-backend-yyho.onrender.com';
    const correctResumeUrl = `${baseUrl}/uploads/${resumeFilename}`;
    
    console.log('🌐 Correct resume URL:', correctResumeUrl);
    
    window.open(correctResumeUrl, '_blank');
    showToast('📄 Opening resume...', 'info');
  } catch (error) {
    console.error('❌ Error opening resume:', error);
    showToast('Error opening resume', 'error');
  }
};

  const viewCandidateProfile = (candidateId) => {
    try {
      navigate(`/employer/candidates/${candidateId}`);
      console.log('Opening candidate profile for ID:', candidateId);
      showToast('👤 Opening candidate profile...', 'info');
    } catch (error) {
      console.error('Error navigating to candidate profile:', error);
      showToast('Error loading candidate profile', 'error');
    }
  };

  const startConversationWithCandidate = async (candidateId, candidateName, candidateEmail) => {
    try {
      navigate('/messages', {
        state: {
          startNewChat: true,
          recipientId: candidateId,
          recipientEmail: candidateEmail,
          recipientName: candidateName
        }
      });
      showToast(`💬 Starting conversation with ${candidateName}`, 'info');
    } catch (error) {
      console.error('Error starting conversation:', error);
      showToast('Error starting conversation', 'error');
    }
  };

  const saveCandidateProfile = (candidate) => {
    const savedProfiles = JSON.parse(localStorage.getItem('savedProfiles') || '[]');
    if (!savedProfiles.find(profile => profile._id === candidate._id)) {
      savedProfiles.push({
        ...candidate,
        savedAt: new Date().toISOString(),
        savedBy: user?.name
      });
      localStorage.setItem('savedProfiles', JSON.stringify(savedProfiles));
      showToast('👤 Candidate profile saved successfully!', 'success');
    } else {
      showToast('👤 Candidate profile already saved', 'info');
    }
  };

  // Effects
  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
    updateStats();
  }, [applications, selectedStatus, searchTerm]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading applications...</p>
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
                  Applications Management
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
            
            {/* Export Dropdown */}
            <div className="relative group">
              <button className="group flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-xl hover:border-green-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                <Download className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="font-medium">Export</span>
              </button>
              <div className="absolute right-0 top-12 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                <button
                  onClick={exportApplications}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 rounded-t-xl"
                >
                  <FileText className="h-4 w-4" />
                  <span>Export as JSON</span>
                </button>
                <button
                  onClick={exportApplicationsCSV}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 rounded-b-xl"
                >
                  <Download className="h-4 w-4" />
                  <span>Export as CSV</span>
                </button>
              </div>
            </div>

            {selectedApplications.size > 0 && (
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  {selectedApplications.size} selected
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-lg mb-8 max-w-3xl">
          Manage and review candidate applications. Status changes will automatically notify candidates in real-time.
        </p>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'from-gray-500 to-gray-600', icon: Users },
            { label: 'Pending', value: stats.pending, color: 'from-yellow-500 to-orange-500', icon: Clock },
            { label: 'Reviewed', value: stats.reviewed, color: 'from-blue-500 to-cyan-600', icon: Eye },
            { label: 'Accepted', value: stats.accepted, color: 'from-green-500 to-emerald-600', icon: CheckCircle },
            { label: 'Rejected', value: stats.rejected, color: 'from-red-500 to-pink-600', icon: XCircle }
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
                    placeholder="Search by candidate name, job title, or email..."
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400"
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
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedApplications.size > 0 && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={selectAllApplications}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {selectedApplications.size === filteredApplications.length ? 'Deselect All' : 'Select All'}
                </button>
                <div className="h-4 w-px bg-gray-300"></div>
                <button
                  onClick={() => setSelectedApplications(new Set())}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span>
                Candidate Applications 
                <span className="text-lg font-normal text-gray-500 ml-2">
                  ({filteredApplications.length})
                </span>
              </span>
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2 lg:mt-0">
              <Sparkles className="h-4 w-4 text-green-500" />
              <span>Real-time notifications enabled</span>
            </div>
          </div>

          <div className="space-y-4">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <div 
                  key={application._id} 
                  className="group relative overflow-hidden"
                  onMouseEnter={() => setHoveredCard(application._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
                  <div className={`relative bg-white border rounded-xl p-6 transition-all duration-300 transform ${
                    hoveredCard === application._id ? '-translate-y-1 shadow-xl border-green-600' : 'border-gray-200 shadow-sm'
                  }`}>
                    <div className="flex items-start justify-between">
                      {/* Left Section - Candidate Info */}
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Selection Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedApplications.has(application._id)}
                          onChange={() => toggleApplicationSelection(application._id)}
                          className="mt-1.5 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        
                        {/* Candidate Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <div className="relative group/avatar">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-800 rounded-xl blur opacity-0 group-hover/avatar:opacity-20 transition duration-500"></div>
                                <div className="relative w-12 h-12 bg-gradient-to-r from-green-600 to-blue-800 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg transform group-hover/avatar:scale-110 transition-transform duration-300 overflow-hidden">
                                  {getImageUrl(application.candidate?.profileImage || application.candidate?.profile?.avatar) ? (
                                    <img 
                                      src={getImageUrl(application.candidate?.profileImage || application.candidate?.profile?.avatar)} 
                                      alt={application.candidate?.name} 
                                      className="w-full h-full rounded-xl object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div 
                                    className={`w-full h-full rounded-xl flex items-center justify-center ${getImageUrl(application.candidate?.profileImage || application.candidate?.profile?.avatar) ? 'hidden' : 'flex'}`}
                                  >
                                    {application.candidate?.name?.charAt(0) || 'C'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                                      {application.candidate?.name}
                                    </h3>
                                    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(application.status)} transform transition-transform duration-300 ${
                                      hoveredCard === application._id ? 'scale-105' : ''
                                    }`}>
                                      {getStatusIcon(application.status)}
                                      <span className="ml-1 capitalize">{application.status}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <p className="text-gray-600 mb-3 font-medium">{application.candidate?.email}</p>
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                                  <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-lg">
                                    <FileText className="h-4 w-4" />
                                    <span className="font-medium">Applied for: {application.job?.title}</span>
                                  </div>
                                  <span className="bg-gray-100 px-3 py-1 rounded-lg font-medium">
                                    {new Date(application.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Candidate Skills */}
                          {application.candidate?.skills && application.candidate.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {application.candidate.skills.slice(0, 5).map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-block bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold border border-gray-300/50 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                                >
                                  {typeof skill === 'string' ? skill : skill?.name || 'Unknown Skill'}
                                </span>
                              ))}
                              {application.candidate.skills.length > 5 && (
                                <span className="inline-block bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold">
                                  +{application.candidate.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Cover Letter Preview */}
                          {application.coverLetter && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                              <p className="text-sm text-gray-600 line-clamp-2 font-medium">
                                {application.coverLetter}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Section - Action Buttons */}
                      <div className="flex flex-col items-end space-y-4 ml-6 min-w-[200px]">
                        {/* Quick Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => saveCandidateProfile(application.candidate)}
                            className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-xl transition-all duration-300 transform hover:scale-110"
                            title="Save Candidate Profile"
                          >
                            <Bookmark className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => startConversationWithCandidate(
                              application.candidate._id,
                              application.candidate.name,
                              application.candidate.email
                            )}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 transform hover:scale-110"
                            title="Message Candidate"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => viewCandidateProfile(application.candidate._id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 transform hover:scale-110"
                            title="View Profile"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Main Action Buttons */}
                        <div className="flex flex-col space-y-2 w-full">
                          <button
                            onClick={() => downloadResume(application.resume)}
                            className="group/btn flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg w-full"
                          >
                            <FileText className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                            <span className="font-semibold">View Resume</span>
                          </button>
                          
                          <div className="grid grid-cols-1 gap-2">
                            <button
                              onClick={() => updateApplicationStatus(application._id, 'accepted')}
                              disabled={application.status === 'accepted'}
                              className={`group/accept flex items-center justify-center space-x-1 px-3 py-2 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 text-sm font-semibold ${
                                application.status === 'accepted'
                                  ? 'bg-green-400 text-white cursor-not-allowed'
                                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-lg'
                              }`}
                            >
                              <CheckCircle className="h-4 w-4 transition-transform group-hover/accept:scale-110" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(application._id, 'rejected')}
                              disabled={application.status === 'rejected'}
                              className={`group/reject flex items-center justify-center space-x-1 px-3 py-2 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 text-sm font-semibold ${
                                application.status === 'rejected'
                                  ? 'bg-red-400 text-white cursor-not-allowed'
                                  : 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 hover:shadow-lg'
                              }`}
                            >
                              <XCircle className="h-4 w-4 transition-transform group-hover/reject:scale-110" />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(application._id, 'reviewed')}
                              disabled={application.status === 'reviewed'}
                              className={`group/review flex items-center justify-center space-x-1 px-3 py-2 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 text-sm font-semibold ${
                                application.status === 'reviewed'
                                  ? 'bg-blue-400 text-white cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 hover:shadow-lg'
                              }`}
                            >
                              <Eye className="h-4 w-4 transition-transform group-hover/review:scale-110" />
                              <span>Mark Reviewed</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <Users className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  {applications.length === 0 
                    ? "You haven't received any applications yet. They'll appear here when candidates apply to your jobs." 
                    : "No applications match your current filters. Try adjusting your search criteria."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Notification Info */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200/50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-900 mb-3">Real-time Notifications</h3>
              <p className="text-blue-800 mb-4">
                When you update application status, candidates receive instant notifications:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl backdrop-blur-sm">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">System Message</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl backdrop-blur-sm">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="text-blue-800 font-medium">Real-time Alert</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl backdrop-blur-sm">
                  <Award className="h-5 w-5 text-purple-600" />
                  <span className="text-blue-800 font-medium">Notification Update</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsManagement;