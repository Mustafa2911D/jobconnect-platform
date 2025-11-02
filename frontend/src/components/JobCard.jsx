import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { savedJobsAPI } from '../api/apiClient.js';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  Zap, 
  ArrowUpRight,
  Bookmark,
  Star,
  Briefcase,
  Eye,
  Users,
  Share2,
  ExternalLink
} from 'lucide-react';
import { showToast } from '../utils/toast.js';
import getImageUrl from '../utils/imageUrl';

const JobCard = ({ job }) => {
  const { user, isAuthenticated } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const formatSalary = (salary) => {
    if (!salary?.min && !salary?.max) return 'Salary negotiable';
    if (salary.min && salary.max) {
      return `R${(salary.min / 1000).toFixed(0)}k - R${(salary.max / 1000).toFixed(0)}k`;
    }
    return salary.min ? `From R${(salary.min / 1000).toFixed(0)}k` : `Up to R${(salary.max / 1000).toFixed(0)}k`;
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'Full-time': 'from-blue-500 to-blue-600',
      'Part-time': 'from-green-500 to-green-600',
      'Contract': 'from-purple-500 to-purple-600',
      'Internship': 'from-orange-500 to-orange-600',
      'Remote': 'from-indigo-500 to-indigo-600',
      'Freelance': 'from-pink-500 to-pink-600'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const formatCount = (count) => {
    if (!count && count !== 0) return '0';
    if (typeof count === 'number') return count.toLocaleString();
    if (typeof count === 'string') {
      const num = parseInt(count);
      return isNaN(num) ? '0' : num.toLocaleString();
    }
    return '0';
  };

  const getViews = () => {
    return formatCount(job.views || job.viewCount || job.totalViews || job.stats?.views || 0);
  };

  const getApplications = () => {
    return formatCount(job.applications || job.applicationCount || job.totalApplications || job.applicants || job.stats?.applications || 0);
  };

  const getEmployerImage = () => {
    if (job.employer?.profileImage) {
      return getImageUrl(job.employer.profileImage);
    }
    if (job.companyLogo) {
      return getImageUrl(job.companyLogo);
    }
    if (job.logo) {
      return getImageUrl(job.logo);
    }
    return null;
  };

  // Bookmark functionality
  const shouldShowBookmark = isAuthenticated && user?.role === 'candidate';
  const employerImage = getEmployerImage();

  // Check if job is already bookmarked
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'candidate' && job._id) {
      checkIfBookmarked();
    } else {
      setIsBookmarked(false);
    }
  }, [isAuthenticated, user, job._id]);

  const checkIfBookmarked = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsBookmarked(false);
        return;
      }

      if (user?.role !== 'candidate') {
        setIsBookmarked(false);
        return;
      }

      const response = await savedJobsAPI.checkIfSaved(job._id);
      setIsBookmarked(response.data.isSaved);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setIsBookmarked(false);
      } else {
        console.error('Error checking bookmark status:', error);
        setIsBookmarked(false);
      }
    }
  };

  const toggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('Please sign in to save jobs', 'error');
      return;
    }

    if (user?.role !== 'candidate') {
      showToast('Only candidates can save jobs', 'error');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      
      if (isBookmarked) {
        await savedJobsAPI.removeSavedJob(job._id);
        setIsBookmarked(false);
        showToast('Job removed from saved jobs', 'success');
      } else {
        await savedJobsAPI.saveJob(job._id);
        setIsBookmarked(true);
        showToast('Job saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      
      if (error.response?.status === 403) {
        showToast('Only candidates can save jobs', 'error');
      } else if (error.response?.status === 401) {
        showToast('Please sign in to save jobs', 'error');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        showToast('Error saving job', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const shareJob = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const jobUrl = `${window.location.origin}/jobs/${job._id}`;
    const shareText = `Check out this job: ${job.title} at ${job.company}`;

    try {
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

  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]">
      
      {/* Featured Badge */}
      {job.featured && (
        <div className="absolute -top-3 -left-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-lg z-10 animate-pulse">
          <Star className="h-3 w-3 mr-1 fill-current" />
          Featured
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {employerImage && !imageError ? (
              <div className={`w-12 h-12 rounded-xl overflow-hidden bg-gray-100 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <img
                  src={employerImage}
                  alt={job.company}
                  className="w-full h-full object-cover"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                {employerImage && !imageError ? (
                  <img 
                    src={employerImage} 
                    alt={job.company}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : null}
                <div 
                  className={`w-full h-full rounded-xl flex items-center justify-center ${employerImage && !imageError ? 'hidden' : 'flex'}`}
                >
                  {job.company?.charAt(0) || 'C'}
                </div>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300 line-clamp-2 leading-tight">
              {job.title}
            </h3>
            <div className="flex items-center space-x-2 text-gray-600 mt-1">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium truncate">{job.company}</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={shareJob}
            className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 transform hover:scale-110"
            title="Share job"
          >
            <Share2 className="h-4 w-4" />
          </button>
          
          {shouldShowBookmark && (
            <button
              onClick={toggleBookmark}
              disabled={loading}
              className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                isBookmarked 
                  ? 'text-yellow-500 bg-yellow-50 shadow-inner' 
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isBookmarked ? 'Remove from saved jobs' : 'Save job'}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Job Type & Location */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getJobTypeColor(job.type)} shadow-md group-hover:shadow-lg transition-shadow`}>
          <Briefcase className="h-3 w-3 mr-1.5" />
          {job.type || 'Full-time'}
        </span>
        
        <div className="flex items-center text-gray-600 text-sm bg-gray-50 px-3 py-1.5 rounded-lg group-hover:bg-gray-100 transition-colors">
          <MapPin className="h-4 w-4 mr-1.5 text-gray-500" />
          <span className="truncate max-w-[120px]">{job.location?.city || job.location || 'Remote'}</span>
        </div>
      </div>

      {/* Salary & Date */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-lg group-hover:bg-green-100 transition-colors">
          <DollarSign className="h-4 w-4 mr-1.5" />
          <span className="text-sm">{formatSalary(job.salary)}</span>
        </div>
        <div className="flex items-center text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg group-hover:bg-gray-100 transition-colors">
          <Clock className="h-4 w-4 mr-1.5" />
          <span className="text-sm">{formatDate(job.createdAt || job.postedDate || job.date)}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed group-hover:text-gray-700 transition-colors">
        {job.description?.substring(0, 120) || 'No description available'}...
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills?.slice(0, 3).map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 group-hover:border-gray-300 transition-all duration-300 hover:scale-105 hover:shadow-sm"
          >
            <Zap className="h-3 w-3 mr-1.5 text-yellow-500" />
            {typeof skill === 'string' ? skill : skill.name}
          </span>
        ))}
        {job.skills?.length > 3 && (
          <span className="inline-flex items-center bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-sm cursor-help" title={`${job.skills.length - 3} more skills`}>
            +{job.skills.length - 3}
          </span>
        )}
        {(!job.skills || job.skills.length === 0) && (
          <span className="inline-flex items-center bg-gradient-to-r from-gray-50 to-gray-100 text-gray-500 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200">
            No skills specified
          </span>
        )}
      </div>

      {/* Footer Section */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-gray-200 transition-colors">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg group-hover:bg-gray-100 transition-colors" title="Total views">
            <Eye className="h-3.5 w-3.5" />
            <span className="font-medium">{getViews()}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg group-hover:bg-gray-100 transition-colors" title="Total applications">
            <Users className="h-3.5 w-3.5" />
            <span className="font-medium">{getApplications()}</span>
          </div>
        </div>
        
        <Link
          to={`/jobs/${job._id || job.id}`}
          className="group/btn relative overflow-hidden bg-gradient-to-r from-green-600 to-blue-800 text-white font-medium py-2.5 px-5 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
        >
          <span className="relative z-10 flex items-center space-x-2">
            <span>Apply Now</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
        </Link>
      </div>

      {/* View Company Profile Button */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Link 
          to={`/employer/${job.employer?._id}/profile`}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 text-green-700 hover:text-green-800 font-medium py-2 px-4 rounded-xl border border-green-200 hover:border-green-300 transition-all duration-300 transform hover:scale-105 hover:shadow-md group/profile"
        >
          <Building className="h-4 w-4" />
          <span>View Company Profile</span>
          <ExternalLink className="h-4 w-4 opacity-0 group-hover/profile:opacity-100 transition-all duration-300" />
        </Link>
      </div>

      {/* Hover Overlay Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default JobCard;