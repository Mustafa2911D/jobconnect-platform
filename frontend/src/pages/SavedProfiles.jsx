import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { savedProfilesAPI } from '../api/apiClient.js';
import { 
  User, Search, Filter, Trash2, Download, Share2, 
  MapPin, Briefcase, Award, Mail, Phone, Calendar,
  ArrowLeft, Eye, Users, Zap, Sparkles, Star,
  RefreshCw, Bookmark, ExternalLink
} from 'lucide-react';
import { showToast } from '../utils/toast.js';
import getImageUrl from '../utils/imageUrl';

const SavedProfiles = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  // Effects
  useEffect(() => {
    fetchSavedProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [savedProfiles, searchTerm]);

  // API Functions
  const fetchSavedProfiles = async () => {
    try {
      setLoading(true);
      const response = await savedProfilesAPI.getSavedProfiles();
      if (response.data.success) {
        setSavedProfiles(response.data.savedProfiles || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch saved profiles');
      }
    } catch (error) {
      console.error('Error fetching saved profiles:', error);
      showToast('Error loading saved profiles', 'error');
      setSavedProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedProfile = async (candidateId) => {
    try {
      await savedProfilesAPI.removeSavedProfile(candidateId);
      setSavedProfiles(prev => prev.filter(profile => profile.candidate._id !== candidateId));
      showToast('Profile removed from saved list', 'success');
    } catch (error) {
      console.error('Error removing saved profile:', error);
      showToast('Error removing profile', 'error');
    }
  };

  const filterProfiles = () => {
    let filtered = savedProfiles;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(profile => 
        profile.candidate?.name?.toLowerCase().includes(term) ||
        profile.candidate?.profile?.headline?.toLowerCase().includes(term) ||
        (profile.candidate?.skills && profile.candidate.skills.some(skill => 
          typeof skill === 'string' ? skill.toLowerCase().includes(term) : 
          skill.name?.toLowerCase().includes(term)
        ))
      );
    }

    setFilteredProfiles(filtered);
  };

  const getSkillNames = (skills) => {
    if (!skills || !Array.isArray(skills)) return [];
    return skills.map(skill => 
      typeof skill === 'string' ? skill : skill.name || 'Unknown Skill'
    );
  };

  const exportSavedProfiles = () => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        totalProfiles: savedProfiles.length,
        profiles: savedProfiles.map(profile => ({
          name: profile.candidate.name,
          headline: profile.candidate.profile?.headline,
          location: profile.candidate.profile?.location,
          skills: profile.candidate.skills,
          experience: profile.candidate.experience,
          education: profile.candidate.education,
          matchScore: profile.matchScore,
          savedAt: profile.savedAt,
          notes: profile.notes
        }))
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `saved-profiles-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Saved profiles exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting saved profiles:', error);
      showToast('Error exporting saved profiles', 'error');
    }
  };

  // Event Handlers
  const contactCandidate = (profile) => {
    showToast(`Opening conversation with ${profile.candidate.name}`, 'info');
    // In production, this would navigate to messages
  };

  const viewProfile = (candidateId) => {
    navigate(`/employer/candidates/${candidateId}`);
  };

  // Constants
  const stats = [
    {
      label: 'Total Saved',
      value: savedProfiles.length,
      icon: User,
      gradient: 'from-green-500 to-emerald-600',
      color: 'text-green-600'
    },
    {
      label: 'Active Candidates',
      value: savedProfiles.filter(profile => {
        const lastActive = new Date(profile.candidate?.stats?.lastActive || profile.savedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return lastActive > weekAgo;
      }).length,
      icon: Eye,
      gradient: 'from-blue-500 to-cyan-600',
      color: 'text-blue-600'
    },
    {
      label: 'This Month',
      value: savedProfiles.filter(profile => {
        const savedDate = new Date(profile.savedAt);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return savedDate > monthAgo;
      }).length,
      icon: Calendar,
      gradient: 'from-purple-500 to-indigo-600',
      color: 'text-purple-600'
    },
    {
      label: 'With Notes',
      value: savedProfiles.filter(profile => profile.notes && profile.notes.trim()).length,
      icon: Sparkles,
      gradient: 'from-orange-500 to-red-600',
      color: 'text-orange-600'
    }
  ];

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading saved profiles...</p>
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
              to="/employer/candidates"
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-all duration-300 group p-2 rounded-lg hover:bg-white/50"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Candidates</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Saved Profiles
              </h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-green-500" />
                Your shortlist of potential candidates
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={exportSavedProfiles}
              disabled={savedProfiles.length === 0}
              className="flex items-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:border-green-600 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-50 hover:scale-105 group"
            >
              <Download className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="font-medium">Export</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold text-gray-900 group-hover:${stat.color} transition-colors`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-8 hover:shadow-xl transition-all duration-300">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Search className="h-4 w-4 text-gray-400 transition-colors group-hover:text-green-600 group-focus-within:text-green-600" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search saved profiles by name, skills, or title..."
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 focus:shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Profiles Grid */}
        {savedProfiles.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Your Saved Profiles ({filteredProfiles.length})
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white/50 px-3 py-1 rounded-full border">
                <Sparkles className="h-4 w-4 text-green-500" />
                <span>Curated talent pool</span>
              </div>
            </div>

            {filteredProfiles.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredProfiles.map((profile) => (
                  <div 
                    key={profile.candidate._id} 
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group relative overflow-hidden"
                    onMouseEnter={() => setHoveredCard(profile.candidate._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Hover gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 transition-opacity duration-500 ${hoveredCard === profile.candidate._id ? 'opacity-100' : ''}`}></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300 shadow-lg overflow-hidden">
                            {getImageUrl(profile.candidate?.profileImage || profile.candidate?.profile?.avatar) ? (
                              <img 
                                src={getImageUrl(profile.candidate?.profileImage || profile.candidate?.profile?.avatar)} 
                                alt={profile.candidate.name} 
                                className="w-full h-full rounded-2xl object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-full h-full rounded-2xl flex items-center justify-center ${getImageUrl(profile.candidate?.profileImage || profile.candidate?.profile?.avatar) ? 'hidden' : 'flex'}`}
                            >
                              {profile.candidate.name?.split(' ').map(n => n[0]).join('')}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300 truncate">
                              {profile.candidate.name}
                            </h3>
                            <p className="text-gray-600 text-sm truncate group-hover:text-gray-700 transition-colors">
                              {profile.candidate.profile?.headline || 'Skilled Professional'}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {profile.candidate.profile?.location?.province && (
                                <div className="flex items-center space-x-1 text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                                  <MapPin className="h-3 w-3" />
                                  <span>{profile.candidate.profile.location.province}</span>
                                </div>
                              )}
                              {profile.candidate.experience?.length > 0 && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <div className="flex items-center space-x-1 text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                                    <Briefcase className="h-3 w-3" />
                                    <span>{profile.candidate.experience.length} position(s)</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeSavedProfile(profile.candidate._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 transform hover:scale-110 opacity-70 group-hover:opacity-100 hover:shadow-md"
                          title="Remove from saved profiles"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {profile.notes && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg group-hover:bg-yellow-100 transition-colors duration-300">
                          <p className="text-sm text-yellow-800 font-medium flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Notes:
                          </p>
                          <p className="text-sm text-yellow-700 mt-1">{profile.notes}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        {getSkillNames(profile.candidate.skills).slice(0, 4).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold border border-gray-300/50 group-hover:border-gray-400/50 transition-all duration-300 hover:scale-105 hover:shadow-sm"
                          >
                            {skill}
                          </span>
                        ))}
                        {profile.candidate.skills?.length > 4 && (
                          <span className="inline-block bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold group-hover:scale-105 transition-transform duration-300">
                            +{profile.candidate.skills.length - 4} more
                          </span>
                        )}
                      </div>

                      <div className="flex space-x-3 pt-4 border-t border-gray-200 group-hover:border-gray-300 transition-colors duration-300">
                        <button
                          onClick={() => viewProfile(profile.candidate._id)}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg font-semibold text-sm flex items-center justify-center gap-2 group/btn"
                        >
                          <Eye className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                          View Profile
                        </button>
                        <button
                          onClick={() => contactCandidate(profile)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg font-semibold text-sm flex items-center justify-center group/btn"
                          title="Contact Candidate"
                        >
                          <Mail className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // No Matching Profiles State
              <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center group hover:scale-110 transition-transform duration-300">
                  <Search className="h-8 w-8 text-gray-400 group-hover:text-gray-500 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No matching profiles found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria to find your saved profiles.
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-green-600 hover:text-green-700 font-medium hover:scale-105 transition-transform duration-300 px-4 py-2 rounded-lg hover:bg-green-50"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-20 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl flex items-center justify-center shadow-lg group hover:scale-110 transition-transform duration-500">
              <User className="h-12 w-12 text-green-600 group-hover:text-green-700 transition-colors" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No saved profiles yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Start building your talent pool by saving promising candidate profiles as you review applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/employer/candidates"
                className="bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl inline-flex items-center space-x-2 group/btn"
              >
                <Zap className="h-5 w-5 transition-transform group-hover/btn:scale-110" />
                <span>Browse Candidates</span>
              </Link>
              <button
                onClick={fetchSavedProfiles}
                className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl inline-flex items-center space-x-2 group/btn"
              >
                <RefreshCw className="h-5 w-5 transition-transform group-hover/btn:scale-110" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedProfiles;