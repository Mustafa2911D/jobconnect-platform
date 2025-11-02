import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { userAPI } from '../api/apiClient.js';
import { 
  Building, MapPin, Globe, Users, Phone, Mail, Eye, 
  TrendingUp, Award, Shield, Briefcase, CheckCircle, 
  Star, ArrowLeft, ExternalLink, Calendar, Clock,
  Heart, Share2, Bookmark
} from 'lucide-react';
import { showToast } from '../utils/toast.js';
import JobCard from '../components/JobCard.jsx';
import getImageUrl from '../../utils/imageUrl';

const EmployerPublicProfile = () => {
  const { employerId } = useParams();
  const navigate = useNavigate();
  
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchEmployerProfile();
  }, [employerId]);

  const fetchEmployerProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getEmployerPublicProfile(employerId);
      setEmployer(response.data.employer);
    } catch (error) {
      console.error('Error fetching employer profile:', error);
      showToast('Error loading employer profile', 'error');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };
  
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Profile link copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy link', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg animate-pulse">Loading employer profile...</p>
        </div>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Employer Not Found</h2>
          <p className="text-gray-600 mb-6">This employer profile is not available.</p>
          <Link 
            to="/jobs" 
            className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Briefcase className="h-4 w-4" />
            <span>Browse Jobs</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center space-x-2 text-gray-600 hover:text-green-600 mb-6 transition-all duration-300 transform hover:-translate-x-1"
          >
            <ArrowLeft className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Back to Jobs</span>
          </button>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                  {getImageUrl(employer.profileImage || employer.companyProfile?.logo) && !imageError ? (
                    <img 
                      src={getImageUrl(employer.profileImage || employer.companyProfile?.logo)} 
                      alt="Company logo" 
                      className="w-full h-full rounded-2xl object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <Building className="h-10 w-10" />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {employer.companyProfile?.name || employer.company}
                </h1>
                <p className="text-gray-600 text-lg mt-2 font-medium">{employer.companyProfile?.industry}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-3">
                  {employer.companyProfile?.contact?.address && (
                    <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm transition-all duration-300 hover:shadow-md">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{employer.companyProfile.contact.address}</span>
                    </div>
                  )}
                  {employer.stats?.activeJobs > 0 && (
                    <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm transition-all duration-300 hover:shadow-md">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{employer.stats.activeJobs} active jobs</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md group"
                title="Share profile"
              >
                <Share2 className="h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors" />
              </button>
              <Link
                to={`/jobs?company=${encodeURIComponent(employer.company)}`}
                className="group inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-700 hover:from-green-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Briefcase className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>View All Jobs</span>
                <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Jobs', value: employer.stats?.totalJobs || 0, icon: TrendingUp, color: 'green' },
            { label: 'Active Jobs', value: employer.stats?.activeJobs || 0, icon: Briefcase, color: 'blue' },
            { label: 'Applications', value: employer.stats?.totalApplications || 0, icon: Users, color: 'purple' },
            { label: 'Response Rate', value: `${employer.stats?.responseRate || 0}%`, icon: Eye, color: 'orange' }
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="group card p-6 text-center cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl bg-white/80 backdrop-blur-sm border border-white/20"
            >
              <div className="flex justify-center mb-3">
                <div className={`p-3 rounded-xl bg-${stat.color}-100 group-hover:bg-${stat.color}-200 transition-colors duration-300`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/80 backdrop-blur-sm rounded-2xl p-1 mb-8 shadow-lg border border-white/20">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'jobs', label: 'Jobs', icon: Briefcase },
            { id: 'about', label: 'About', icon: Building },
            { id: 'benefits', label: 'Benefits', icon: Award }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex-1 py-4 px-4 rounded-xl text-sm font-medium transition-all duration-500 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-green-600 to-blue-800 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-600/10 transform hover:scale-105'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <tab.icon className={`h-4 w-4 transition-transform duration-300 ${
                  activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content with Animation */}
        <div className="space-y-8">
          <div className="transition-all duration-500 ease-in-out">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                {/* Company Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="group card p-8 transition-all duration-500 hover:shadow-2xl bg-white/90 backdrop-blur-sm border border-white/20">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Building className="h-6 w-6 text-green-600" />
                      </div>
                      <span>Company Overview</span>
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {employer.companyProfile?.description || 'No company description available.'}
                    </p>
                  </div>

                  {/* Mission & Culture */}
                  {(employer.companyProfile?.mission || employer.companyProfile?.culture) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {employer.companyProfile?.mission && (
                        <div className="group card p-6 transition-all duration-500 hover:shadow-xl hover:border-green-200 border border-transparent">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-3">
                            <Award className="h-5 w-5 text-green-600" />
                            <span>Our Mission</span>
                          </h4>
                          <p className="text-gray-700 leading-relaxed">{employer.companyProfile.mission}</p>
                        </div>
                      )}
                      {employer.companyProfile?.culture && (
                        <div className="group card p-6 transition-all duration-500 hover:shadow-xl hover:border-blue-200 border border-transparent">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-3">
                            <Users className="h-5 w-5 text-blue-600" />
                            <span>Work Culture</span>
                          </h4>
                          <p className="text-gray-700 leading-relaxed">{employer.companyProfile.culture}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div className="group card p-6 transition-all duration-500 hover:shadow-xl bg-white/90 backdrop-blur-sm border border-white/20">
                    <h4 className="font-semibold text-gray-900 mb-6 text-lg">Contact Information</h4>
                    <div className="space-y-4">
                      {employer.companyProfile?.contact?.email && (
                        <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-green-50 transition-colors duration-300">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Mail className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-gray-700 font-medium">{employer.companyProfile.contact.email}</span>
                        </div>
                      )}
                      {employer.companyProfile?.contact?.phone && (
                        <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-300">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Phone className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="text-gray-700 font-medium">{employer.companyProfile.contact.phone}</span>
                        </div>
                      )}
                      {employer.companyProfile?.website && (
                        <a 
                          href={employer.companyProfile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-4 p-3 rounded-lg hover:bg-purple-50 transition-all duration-300 group"
                        >
                          <div className="p-2 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform">
                            <Globe className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="text-green-600 font-medium group-hover:text-green-700">
                            Visit Website
                          </span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="group card p-6 transition-all duration-500 hover:shadow-xl bg-white/90 backdrop-blur-sm border border-white/20">
                    <h4 className="font-semibold text-gray-900 mb-6 text-lg">Company Details</h4>
                    <div className="space-y-4">
                      {[
                        { label: 'Company Size', value: employer.companyProfile?.size, icon: Users },
                        { label: 'Industry', value: employer.companyProfile?.industry, icon: Building },
                        { label: 'Founded', value: employer.companyProfile?.founded, icon: Calendar }
                      ].map((detail, index) => (
                        detail.value && (
                          <div key={detail.label} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                            <div className="flex items-center space-x-3">
                              <detail.icon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600 font-medium">{detail.label}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{detail.value}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">Active Job Opportunities</h3>
                  <span className="text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
                    {employer.activeJobs?.length || 0} positions
                  </span>
                </div>
                {employer.activeJobs && employer.activeJobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {employer.activeJobs.map((job) => (
                      <JobCard key={job._id} job={job} />
                    ))}
                  </div>
                ) : (
                  <div className="card p-12 text-center group transition-all duration-500 hover:shadow-xl">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                      <Briefcase className="h-10 w-10 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">No Active Jobs</h4>
                    <p className="text-gray-600 max-w-md mx-auto">
                      This employer doesn't have any active job postings at the moment. Check back later for new opportunities!
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="group card p-8 transition-all duration-500 hover:shadow-2xl animate-fadeIn bg-white/90 backdrop-blur-sm border border-white/20">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Building className="h-8 w-8 text-blue-600" />
                  </div>
                  <span>About {employer.companyProfile?.name || employer.company}</span>
                </h3>
                <div className="prose max-w-none text-gray-700">
                  {employer.companyProfile?.description ? (
                    <div className="space-y-6">
                      <p className="text-lg leading-relaxed font-medium text-gray-800">
                        {employer.companyProfile.description}
                      </p>
                      {employer.companyProfile?.mission && (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border-l-4 border-green-500">
                          <h4 className="font-bold text-gray-900 mb-3 text-lg">Our Mission</h4>
                          <p className="text-gray-700 leading-relaxed">{employer.companyProfile.mission}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-lg">No detailed company information available.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div className="group card p-8 transition-all duration-500 hover:shadow-2xl animate-fadeIn bg-white/90 backdrop-blur-sm border border-white/20">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                  <span>Employee Benefits & Perks</span>
                </h3>
                {employer.companyProfile?.benefits && employer.companyProfile.benefits.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {employer.companyProfile.benefits.map((benefit, index) => (
                      <div 
                        key={index} 
                        className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:border-green-200"
                      >
                        <div className="p-2 bg-green-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="text-gray-700 font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">No Benefits Listed</h4>
                    <p className="text-gray-600">Benefits information will be available soon.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add custom animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EmployerPublicProfile;