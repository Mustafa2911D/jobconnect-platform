import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiClient } from '../api/apiClient.js';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  ArrowLeft, 
  CheckCircle, 
  Calendar,
  User,
  FileText,
  Upload,
  Shield,
  Briefcase,
  Star,
  Share2,
  ExternalLink,
  Eye,
  Loader 
} from 'lucide-react';
import { showToast } from '../utils/toast.js';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSticky, setIsSticky] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 

  // Effects
  useEffect(() => {
    fetchJob();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // API Functions
  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/jobs/${id}`);
      setJob(response.data.job);
    } catch (error) {
      console.error('Error fetching job:', error);
      showToast('Job not found', 'error');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resume) {
      showToast('Please upload your resume', 'error');
      return;
    }

    // File size validation
    if (resume.size > 5 * 1024 * 1024) {
      showToast('File size too large. Maximum 5MB allowed.', 'error');
      return;
    }

    setApplying(true);
    setUploadProgress(0); 

    try {
      const formData = new FormData();
      formData.append('jobId', id);
      formData.append('coverLetter', coverLetter);
      formData.append('resume', resume);

      const response = await apiClient.post('/applications/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, 
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
            console.log(`Upload Progress: ${percentCompleted}%`);
          }
        },
      });

      setApplicationSuccess(true);
      showToast('Application submitted successfully!', 'success');
    } catch (error) {
      console.error('Error applying for job:', error);
      
      if (error.code === 'ECONNABORTED') {
        showToast('Upload is taking longer than expected. Please try again with a smaller file.', 'error');
      } else if (error.response?.data?.message) {
        showToast(error.response.data.message, 'error');
      } else {
        showToast('Failed to apply for job. Please try again.', 'error');
      }
    } finally {
      setApplying(false);
      setUploadProgress(0); 
    }
  };

  // Utility Functions
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = 'https://jobconnect-backend-yyho.onrender.com';
    if (imagePath.startsWith('uploads/')) {
      return `${baseUrl}/${imagePath}`;
    }
    return `${baseUrl}/uploads/profile-images/${imagePath}`;
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Salary not specified';
    if (salary.min && salary.max) {
      return `R ${salary.min.toLocaleString()} - R ${salary.max.toLocaleString()} ${salary.period === 'annually' ? 'per annum' : salary.period}`;
    }
    return 'Salary not specified';
  };

  const formatLocation = (location) => {
    if (!location) return 'Location not specified';
    if (typeof location === 'string') return location;
    return `${location.city}, ${location.province}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job: ${job.title} at ${job.company}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Loading State
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-24 mb-8"></div>
          <div className="card p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-24 mt-4 lg:mt-0"></div>
            </div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Job Not Found State
  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="card p-12 max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Briefcase className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            to="/jobs" 
            className="btn-primary w-full transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            Browse Available Jobs
          </Link>
        </div>
      </div>
    );
  }

  // Application Success State
  if (applicationSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-12 text-center max-w-2xl mx-auto hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            Application Submitted!
          </h2>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            Your application for <strong className="text-gray-900">{job.title}</strong> at{' '}
            <strong className="text-gray-900">{job.company}</strong> has been submitted successfully.
            We'll review your application and get back to you soon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/jobs" 
              className="btn-primary px-8 py-3 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Browse More Jobs
            </Link>
            <Link 
              to={user?.role === 'candidate' ? '/candidate/dashboard' : '/'}
              className="btn-secondary px-8 py-3 transition-all duration-300 hover:shadow-md hover:scale-105"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-all duration-200 group hover:translate-x-1"
      >
        <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
        Back to Jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header Card */}
          <div className="card p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden">
                    {getImageUrl(job.employer?.profileImage || job.companyLogo) ? (
                      <img 
                        src={getImageUrl(job.employer?.profileImage || job.companyLogo)} 
                        alt={job.company} 
                        className="w-full h-full rounded-2xl object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full rounded-2xl flex items-center justify-center ${getImageUrl(job.employer?.profileImage || job.companyLogo) ? 'hidden' : 'flex'}`}
                    >
                      {job.company?.charAt(0).toUpperCase() || 'C'}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                      {job.title}
                    </h1>
                    <div className="flex items-center space-x-3">
                      <Link 
                        to={`/employer/${job.employer?._id}/profile`}
                        className="group/employer flex items-center space-x-2 text-xl text-gray-700 font-semibold hover:text-green-600 transition-all duration-300 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl border border-green-200"
                      >
                        <Building className="h-5 w-5 text-green-600" />
                        <span>{job.company}</span>
                        <ExternalLink className="h-4 w-4 text-green-500 opacity-0 group-hover/employer:opacity-100 transition-all duration-300 transform group-hover/employer:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600 group">
                    <Building className="h-5 w-5 mr-3 text-primary-600 group-hover:text-primary-700 transition-colors duration-200" />
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <Link 
                        to={`/employer/${job.employer?._id}/profile`}
                        className="font-semibold text-gray-900 hover:text-green-600 transition-colors duration-300 flex items-center space-x-1 group/company"
                      >
                        <span>{job.company}</span>
                        <ExternalLink className="h-3 w-3 text-green-500 opacity-0 group-hover/company:opacity-100 transition-all duration-300" />
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600 group">
                    <MapPin className="h-5 w-5 mr-3 text-primary-600 group-hover:text-primary-700 transition-colors duration-200" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold text-gray-900">{formatLocation(job.location)}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600 group">
                    <Clock className="h-5 w-5 mr-3 text-primary-600 group-hover:text-primary-700 transition-colors duration-200" />
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-semibold text-gray-900">{job.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600 group">
                    <DollarSign className="h-5 w-5 mr-3 text-primary-600 group-hover:text-primary-700 transition-colors duration-200" />
                    <div>
                      <p className="text-sm text-gray-500">Salary</p>
                      <p className="font-semibold text-gray-900">{formatSalary(job.salary)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 mt-4 lg:mt-0">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary-100 text-primary-800 border border-primary-200">
                  {job.type}
                </span>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 hover:shadow-md"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center text-gray-500 text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                Posted on {formatDate(job.createdAt)}
              </div>
              {job.urgent && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Urgent Hire
                </span>
              )}
            </div>
          </div>

          {/* Job Description Card */}
          <div className="card p-8 hover:shadow-lg transition-all duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="h-6 w-6 mr-3 text-primary-600" />
              Job Description
            </h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                {job.description}
              </p>
            </div>
          </div>

          {/* Requirements Card */}
          <div className="card p-8 hover:shadow-lg transition-all duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Shield className="h-6 w-6 mr-3 text-primary-600" />
              Requirements & Qualifications
            </h3>
            <ul className="space-y-3">
              {job.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start text-gray-700 group hover:text-gray-900 transition-colors duration-200">
                  <CheckCircle className="h-5 w-5 mr-3 mt-0.5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <span className="leading-relaxed">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className={`space-y-6 ${isSticky ? 'lg:sticky lg:top-8 transition-all duration-300' : ''}`}>
            
            {/* Application Card */}
            {isAuthenticated && user?.role === 'candidate' && (
              <div className="card p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-primary-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  Apply for this Position
                </h2>
                
                <form onSubmit={handleApply} className="space-y-6">
                  <div className="group">
                    <label className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Upload className="h-4 w-4 mr-2 text-primary-600" />
                      Upload Resume
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setResume(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center group-hover:border-primary-400 transition-colors duration-200">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {resume ? resume.name : 'Click to upload resume'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, DOC, DOCX (Max: 5MB)
                        </p>
                        {resume && (
                          <p className="text-xs text-green-600 font-medium mt-1">
                            {formatFileSize(resume.size)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upload Progress Bar */}
                  {applying && uploadProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="group">
                    <label className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary-600" />
                      Cover Letter
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={5}
                      className="input-field resize-none transition-all duration-200 focus:ring-2 focus:ring-primary-200 focus:border-primary-500 hover:border-gray-400"
                      placeholder="Tell us why you're the perfect candidate for this position..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={applying}
                    className="btn-primary w-full py-3 text-lg font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none relative overflow-hidden"
                  >
                    {applying ? (
                      <div className="flex items-center justify-center">
                        <Loader className="h-5 w-5 animate-spin mr-3" />
                        {uploadProgress === 100 ? 'Processing...' : `Uploading... ${uploadProgress}%`}
                      </div>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Auth Required Card */}
            {!isAuthenticated && (
              <div className="card p-6 text-center hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-100">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Interested in this position?
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Sign in to your candidate account to apply for this exciting opportunity.
                </p>
                <div className="space-y-3">
                  <Link 
                    to="/login" 
                    className="btn-primary w-full transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn-secondary w-full transition-all duration-300 hover:shadow-md hover:scale-105"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}

            {/* Employer Card */}
            {isAuthenticated && user?.role === 'employer' && (
              <div className="card p-6 text-center hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
                <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                  <Building className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Employer Account
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  This feature is for candidates. Switch to a candidate account to apply for jobs.
                </p>
                <Link 
                  to="/employer/dashboard" 
                  className="btn-primary w-full bg-orange-600 hover:bg-orange-700 transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  Go to Employer Dashboard
                </Link>
              </div>
            )}

            {/* Job Summary Card */}
            <div className="card p-6 bg-gray-50 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">Job Summary</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Position:</span>
                  <span className="font-medium text-gray-900">{job.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Company:</span>
                  <Link 
                    to={`/employer/${job.employer?._id}/profile`}
                    className="font-medium text-gray-900 hover:text-green-600 transition-colors duration-300 flex items-center space-x-1 group/company"
                  >
                    <span>{job.company}</span>
                    <ExternalLink className="h-3 w-3 text-green-500 opacity-0 group-hover/company:opacity-100 transition-all duration-300" />
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-gray-900">{formatLocation(job.location)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900">{job.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span className="font-medium text-gray-900">{formatDate(job.createdAt)}</span>
                </div>
              </div>
              
              {/* View Company Profile Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link 
                  to={`/employer/${job.employer?._id}/profile`}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 text-green-700 hover:text-green-800 font-medium py-3 px-4 rounded-xl border border-green-200 hover:border-green-300 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Company Profile</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;