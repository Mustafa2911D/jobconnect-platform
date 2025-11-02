import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { employerAPI, savedProfilesAPI } from '../../api/apiClient.js';
import { 
  ArrowLeft, Mail, Phone, MapPin, Briefcase, Award, 
  BookOpen, Calendar, Star, Download, Share2, Users,
  FileText, Building, Clock, CheckCircle, MessageCircle,
  Zap, Sparkles, TrendingUp, Target, User, ArrowUpRight,
  Heart, Bookmark, ExternalLink, Award as AwardIcon,
  Save
} from 'lucide-react';
import { showToast } from '../../utils/toast.js';
import getImageUrl from '../../utils/imageUrl';

const CandidateDetails = () => {
  const { candidateId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State Management
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateExperienceDuration = (startDate, endDate, current) => {
    const start = new Date(startDate);
    const end = current ? new Date() : new Date(endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  };

  const getSkillName = (skill) => {
    if (typeof skill === 'string') return skill;
    if (skill && typeof skill === 'object' && skill.name) return skill.name;
    return 'Unknown Skill';
  };

  const getSkillLevel = (skill) => {
    if (typeof skill === 'string') return 'intermediate';
    if (skill && typeof skill === 'object' && skill.level) return skill.level;
    return 'intermediate';
  };

  // API Functions
  const fetchCandidateDetails = async () => {
    try {
      const response = await employerAPI.getCandidateDetails(candidateId);
      setCandidate(response.data.candidate);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      showToast('Error loading candidate profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkIfBookmarked = async () => {
    try {
      const response = await savedProfilesAPI.checkIfProfileSaved(candidateId);
      setIsBookmarked(response.data.isSaved);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      setIsBookmarked(false);
    }
  };

  const saveProfile = async () => {
    try {
      if (isBookmarked) {
        await savedProfilesAPI.removeSavedProfile(candidateId);
        setIsBookmarked(false);
        showToast('Profile removed from saved', 'success');
      } else {
        await savedProfilesAPI.saveProfile(candidateId);
        setIsBookmarked(true);
        showToast('Profile saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('Error saving profile', 'error');
    }
  };

  // Export Functions
  const exportCandidateProfile = () => {
    try {
      const profileData = {
        exportedAt: new Date().toISOString(),
        candidate: {
          name: candidate.name,
          email: candidate.email,
          profile: candidate.profile,
          skills: candidate.skills,
          experience: candidate.experience,
          education: candidate.education,
          stats: candidate.stats
        }
      };

      const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidate-profile-${candidate.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Candidate profile exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting candidate profile:', error);
      showToast('Error exporting profile', 'error');
    }
  };

  // Action Handlers
  const shareProfile = async () => {
    try {
      const profileUrl = `${window.location.origin}/employer/candidates/${candidateId}`;
      const shareText = `Check out ${candidate.name}'s profile - ${candidate.profile?.headline || 'Skilled Professional'}`;

      if (navigator.share) {
        await navigator.share({
          title: `${candidate.name} - Professional Profile`,
          text: shareText,
          url: profileUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${profileUrl}`);
        showToast('Profile link copied to clipboard!', 'success');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  const contactCandidate = () => {
    if (candidate) {
      navigate('/messages', {
        state: {
          startNewChat: true,
          recipientId: candidate._id,
          recipientEmail: candidate.email,
          recipientName: candidate.name
        }
      });
    }
  };

  const startConversation = () => {
    if (candidate) {
      navigate('/messages', {
        state: {
          startNewChat: true,
          recipientId: candidate._id,
          recipientEmail: candidate.email,
          recipientName: candidate.name
        }
      });
      showToast(`💬 Starting conversation with ${candidate.name}`, 'info');
    }
  };

  // Effects
  useEffect(() => {
    fetchCandidateDetails();
    checkIfBookmarked();
  }, [candidateId]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading candidate profile...</p>
          <p className="text-gray-500 text-sm mt-2">Getting everything ready</p>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-20 w-20 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidate Not Found</h2>
          <p className="text-gray-600 text-lg mb-6">The candidate you're looking for doesn't exist.</p>
          <Link 
            to="/employer/candidates" 
            className="group inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Candidates</span>
          </Link>
        </div>
      </div>
    );
  }

  // Tab Configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: Award },
    { id: 'skills', label: 'Skills', icon: BookOpen }
  ];

  // Main Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/employer/candidates"
              className="group flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-all duration-300 transform hover:-translate-x-1"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Candidates</span>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button 
              onClick={saveProfile}
              className={`group flex items-center justify-center space-x-2 px-6 py-3 border rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg ${
                isBookmarked 
                  ? 'bg-yellow-500 border-yellow-500 text-white hover:bg-yellow-600 hover:border-yellow-600' 
                  : 'bg-white border-gray-300 text-gray-700 hover:border-green-600'
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              <span className="font-medium">{isBookmarked ? 'Bookmarked' : 'Bookmark Profile'}</span>
            </button>
            <button 
              onClick={exportCandidateProfile}
              className="group flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-xl hover:border-green-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="font-medium">Export Profile</span>
            </button>
            <button 
              onClick={shareProfile}
              className="group flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-800 text-white rounded-xl hover:from-blue-800 hover:to-green-600 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Share2 className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="font-medium">Share</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 sticky top-24">
              <div className="text-center mb-6">
                <div className="relative inline-block group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg transform group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                    {getImageUrl(candidate.profileImage || candidate.profile?.avatar) ? (
                      <img 
                        src={getImageUrl(candidate.profileImage || candidate.profile?.avatar)} 
                        alt={candidate.name} 
                        className="w-full h-full rounded-2xl object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full rounded-2xl flex items-center justify-center ${getImageUrl(candidate.profileImage || candidate.profile?.avatar) ? 'hidden' : 'flex'}`}
                    >
                      {candidate.name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                  {candidate.name}
                </h2>
                <p className="text-gray-600 font-medium mb-3">{candidate.profile?.headline || 'Professional Candidate'}</p>
                
                {candidate.profile?.location && (
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {candidate.profile.location.city && `${candidate.profile.location.city}, `}
                      {candidate.profile.location.province}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    onClick={startConversation}
                    className="group flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <MessageCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
                    <span className="font-semibold">Send Message</span>
                  </button>
                  <button
                    onClick={contactCandidate}
                    className="group flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <Mail className="h-4 w-4 transition-transform group-hover:scale-110" />
                    <span className="font-semibold">Contact</span>
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                {candidate.stats && (
                  <>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300">
                      <span className="text-sm font-medium text-gray-700">Profile Views</span>
                      <span className="font-bold text-green-600">{candidate.stats.profileViews || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300">
                      <span className="text-sm font-medium text-gray-700">Applications</span>
                      <span className="font-bold text-blue-600">{candidate.stats.jobApplications || 0}</span>
                    </div>
                  </>
                )}
                
                {candidate.skills && candidate.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>Top Skills</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold border border-gray-300/50 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                          {getSkillName(skill)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="lg:col-span-3">
            {/* Navigation Tabs */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
              <nav className="flex space-x-8">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group flex items-center space-x-2 py-2 border-b-2 font-medium text-sm transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'border-green-600 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <TabIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <OverviewTab 
                candidate={candidate} 
                hoveredCard={hoveredCard} 
                setHoveredCard={setHoveredCard}
                formatDate={formatDate}
              />
            )}
            {activeTab === 'experience' && (
              <ExperienceTab 
                candidate={candidate} 
                hoveredCard={hoveredCard} 
                setHoveredCard={setHoveredCard}
                formatDate={formatDate}
                calculateExperienceDuration={calculateExperienceDuration}
              />
            )}
            {activeTab === 'education' && (
              <EducationTab 
                candidate={candidate} 
                hoveredCard={hoveredCard} 
                setHoveredCard={setHoveredCard}
              />
            )}
            {activeTab === 'skills' && (
              <SkillsTab candidate={candidate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab Components
const OverviewTab = ({ candidate, hoveredCard, setHoveredCard, formatDate }) => (
  <div className="space-y-6">
    {/* Bio */}
    {candidate.profile?.bio && (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
            <User className="h-5 w-5 text-white" />
          </div>
          <span>About</span>
        </h3>
        <p className="text-gray-700 leading-relaxed text-lg">{candidate.profile.bio}</p>
      </div>
    )}

    {/* Quick Overview */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Experience Summary */}
      <div 
        className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        onMouseEnter={() => setHoveredCard('experience')}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span>Experience Summary</span>
        </h3>
        {candidate.experience && candidate.experience.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Experience</span>
              <span className="font-bold text-gray-900 text-lg">
                {calculateTotalExperience(candidate.experience)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Positions</span>
              <span className="font-bold text-gray-900 text-lg">{candidate.experience.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Role</span>
              <span className="font-bold text-gray-900 text-lg text-right">
                {candidate.experience.find(exp => exp.current)?.title || 'Not specified'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No experience listed</p>
        )}
      </div>

      {/* Education Summary */}
      <div 
        className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        onMouseEnter={() => setHoveredCard('education')}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
            <AwardIcon className="h-5 w-5 text-white" />
          </div>
          <span>Education Summary</span>
        </h3>
        {candidate.education && candidate.education.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Highest Qualification</span>
              <span className="font-bold text-gray-900 text-lg text-right">
                {getHighestQualification(candidate.education)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Institutions</span>
              <span className="font-bold text-gray-900 text-lg">{candidate.education.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Latest Education</span>
              <span className="font-bold text-gray-900 text-lg">
                {candidate.education[0]?.year || 'N/A'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No education listed</p>
        )}
      </div>
    </div>

    {/* Applications to Your Jobs */}
    {candidate.applications && candidate.applications.length > 0 && (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
            <Target className="h-5 w-5 text-white" />
          </div>
          <span>Applications to Your Jobs</span>
        </h3>
        <div className="space-y-3">
          {candidate.applications.map((application, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-600 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <div>
                <h4 className="font-bold text-gray-900">{application.job?.title}</h4>
                <p className="text-sm text-gray-600">Applied {formatDate(application.createdAt)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                application.status === 'accepted' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
                application.status === 'rejected' ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' :
                application.status === 'reviewed' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' :
                'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
              } shadow-lg`}>
                {application.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const ExperienceTab = ({ candidate, hoveredCard, setHoveredCard, formatDate, calculateExperienceDuration }) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
        <Briefcase className="h-5 w-5 text-white" />
      </div>
      <span>Work Experience</span>
    </h3>
    {candidate.experience && candidate.experience.length > 0 ? (
      <div className="space-y-6">
        {candidate.experience.map((exp, index) => (
          <div 
            key={index} 
            className="border-l-2 border-green-600 pl-6 pb-6 relative group"
            onMouseEnter={() => setHoveredCard(`exp-${index}`)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="absolute -left-2 top-0 w-4 h-4 bg-green-600 rounded-full transform group-hover:scale-150 transition-transform duration-300"></div>
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-3">
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                  {exp.title}
                </h4>
                <p className="text-gray-700 font-medium text-lg">{exp.company}</p>
                {exp.location && <p className="text-gray-600 text-sm">{exp.location}</p>}
              </div>
              <div className="text-right text-sm text-gray-600">
                <div className="flex items-center space-x-1 justify-end">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                <span className="text-gray-500 font-medium">
                  {calculateExperienceDuration(exp.startDate, exp.endDate, exp.current)}
                </span>
              </div>
            </div>
            {exp.description && (
              <p className="text-gray-700 mt-3 leading-relaxed">{exp.description}</p>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-12">
        <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No work experience listed</p>
      </div>
    )}
  </div>
);

const EducationTab = ({ candidate, hoveredCard, setHoveredCard }) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
      <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
        <Award className="h-5 w-5 text-white" />
      </div>
      <span>Education</span>
    </h3>
    {candidate.education && candidate.education.length > 0 ? (
      <div className="space-y-6">
        {candidate.education.map((edu, index) => (
          <div 
            key={index} 
            className="border-l-2 border-blue-600 pl-6 pb-6 relative group"
            onMouseEnter={() => setHoveredCard(`edu-${index}`)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full transform group-hover:scale-150 transition-transform duration-300"></div>
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {edu.qualification}
                </h4>
                <p className="text-gray-700 font-medium text-lg">{edu.institution}</p>
                {edu.field && <p className="text-gray-600 text-sm">{edu.field}</p>}
              </div>
              <div className="text-right text-sm text-gray-600">
                {edu.year && <span className="font-medium">Graduated {edu.year}</span>}
                {edu.completed !== undefined && (
                  <div className="flex items-center space-x-1 mt-2 justify-end">
                    {edu.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className="font-medium">{edu.completed ? 'Completed' : 'In Progress'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-12">
        <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No education information listed</p>
      </div>
    )}
  </div>
);

const SkillsTab = ({ candidate }) => {
  const getSkillName = (skill) => {
    if (typeof skill === 'string') return skill;
    if (skill && typeof skill === 'object' && skill.name) return skill.name;
    return 'Unknown Skill';
  };

  const getSkillLevel = (skill) => {
    if (typeof skill === 'string') return 'intermediate';
    if (skill && typeof skill === 'object' && skill.level) return skill.level;
    return 'intermediate';
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <span>Skills & Expertise</span>
      </h3>
      {candidate.skills && candidate.skills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidate.skills.map((skill, index) => {
            const skillName = getSkillName(skill);
            const skillLevel = getSkillLevel(skill);
            
            return (
              <div 
                key={index} 
                className="group flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-800 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <span className="text-white font-bold text-sm">
                      {skillName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                      {skillName}
                    </h4>
                    <p className="text-sm text-gray-600 capitalize font-medium">{skillLevel}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 transition-transform duration-300 ${
                        star <= (skillLevel === 'beginner' ? 2 : 
                               skillLevel === 'intermediate' ? 3 : 5)
                          ? 'text-yellow-500 fill-current group-hover:scale-110'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No skills listed</p>
        </div>
      )}
    </div>
  );
};

// Helper functions
const calculateTotalExperience = (experience) => {
  let totalMonths = 0;
  
  experience.forEach(exp => {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : new Date(exp.endDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    totalMonths += Math.max(0, months);
  });
  
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
};

const getHighestQualification = (education) => {
  const qualifications = education.map(edu => edu.qualification?.toLowerCase() || '');
  
  if (qualifications.some(q => q.includes('phd') || q.includes('doctor'))) return 'PhD';
  if (qualifications.some(q => q.includes('master'))) return 'Masters';
  if (qualifications.some(q => q.includes('bachelor') || q.includes('undergraduate'))) return 'Bachelors';
  if (qualifications.some(q => q.includes('diploma'))) return 'Diploma';
  if (qualifications.some(q => q.includes('certificate'))) return 'Certificate';
  
  return education[0]?.qualification || 'Not specified';
};

export default CandidateDetails;