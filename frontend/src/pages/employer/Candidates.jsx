import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { employerAPI, savedProfilesAPI } from '../../api/apiClient.js';
import { 
  Search, Filter, Users, Mail, MapPin, Briefcase, Star, 
  Download, Eye, Award, BookOpen, ChevronDown, ChevronUp,
  User, Phone, Calendar, Menu, X, Sparkles, TrendingUp,
  Bookmark
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { showToast } from '../../utils/toast.js';
import getImageUrl from '../../utils/imageUrl';

const Candidates = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State Management
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [contactingCandidate, setContactingCandidate] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [savedStatus, setSavedStatus] = useState({});
  
  const [filters, setFilters] = useState({
    skills: '',
    location: '',
    minMatchScore: 0,
    experience: ''
  });

  const getSkillName = (skill) => {
    if (typeof skill === 'string') return skill;
    if (skill && typeof skill === 'object' && skill.name) return skill.name;
    return 'Unknown Skill';
  };

  const getSkillNames = (skills) => {
    if (!skills || !Array.isArray(skills)) return [];
    return skills.map(skill => getSkillName(skill));
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const calculateTotalExperience = (experience) => {
    if (!experience || experience.length === 0) return 0;
    
    return experience.reduce((total, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.current ? new Date() : new Date(exp.endDate);
      const years = (end - start) / (365 * 24 * 60 * 60 * 1000);
      return total + Math.max(0, years);
    }, 0);
  };

  // API Functions
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      console.log('Fetching potential candidates...');
      
      const response = await employerAPI.getPotentialCandidates();
      console.log('Candidates response:', response.data);
      
      if (response.data.success) {
        const candidatesData = response.data.candidates || [];
        setCandidates(candidatesData);
        checkAllSavedStatus(candidatesData);
      } else {
        throw new Error(response.data.message || 'Failed to fetch candidates');
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      const mockCandidates = getMockCandidates();
      setCandidates(mockCandidates);
      checkAllSavedStatus(mockCandidates);
    } finally {
      setLoading(false);
    }
  };

  const checkAllSavedStatus = async (candidatesList) => {
    const statusMap = {};
    for (const candidate of candidatesList) {
      try {
        const response = await savedProfilesAPI.checkIfProfileSaved(candidate._id);
        statusMap[candidate._id] = response.data.isSaved;
      } catch (error) {
        console.error(`Error checking saved status for candidate ${candidate._id}:`, error);
        statusMap[candidate._id] = false;
      }
    }
    setSavedStatus(statusMap);
  };

  const saveCandidateProfile = async (candidateId, candidateName) => {
    try {
      const isCurrentlySaved = savedStatus[candidateId];
      
      if (isCurrentlySaved) {
        await savedProfilesAPI.removeSavedProfile(candidateId);
        setSavedStatus(prev => ({
          ...prev,
          [candidateId]: false
        }));
        showToast('Profile removed from saved', 'success');
      } else {
        await savedProfilesAPI.saveProfile(candidateId);
        setSavedStatus(prev => ({
          ...prev,
          [candidateId]: true
        }));
        showToast(`${candidateName} saved to your profiles!`, 'success');
      }
    } catch (error) {
      console.error('Error saving candidate profile:', error);
      if (error.response?.status === 400 && error.response?.data?.message === 'Profile already saved') {
        showToast('Profile already saved', 'info');
      } else {
        showToast('Error saving candidate profile', 'error');
      }
    }
  };

  // Action Handlers
  const viewCandidateProfile = (candidateId) => {
    navigate(`/employer/candidates/${candidateId}`);
  };

  const contactCandidate = async (candidateId, candidateEmail, candidateName) => {
    if (contactingCandidate === candidateId) {
      console.log('⏳ Already contacting this candidate, skipping duplicate');
      return;
    }

    try {
      setContactingCandidate(candidateId);
      console.log('🔵 Contacting candidate:', { candidateId, candidateEmail, candidateName });
      
      navigate('/messages', { 
        replace: true,
        state: { 
          startNewChat: true,
          recipientId: candidateId,
          recipientEmail: candidateEmail,
          recipientName: candidateName
        }
      });
      
      showToast(`Starting conversation with ${candidateName}`, 'success');
      
    } catch (error) {
      console.error('❌ Error navigating to messages:', error);
      showToast('Error starting conversation', 'error');
    } finally {
      setTimeout(() => {
        setContactingCandidate(null);
      }, 3000);
    }
  };

  const toggleCandidateExpansion = (candidateId) => {
    setExpandedCandidate(expandedCandidate === candidateId ? null : candidateId);
  };

  // Data Processing Functions
  const filterCandidates = () => {
    let filtered = candidates;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(candidate =>
        candidate.name?.toLowerCase().includes(term) ||
        candidate.profile?.headline?.toLowerCase().includes(term) ||
        getSkillNames(candidate.skills)?.some(skill => skill.toLowerCase().includes(term))
      );
    }

    if (filters.location) {
      filtered = filtered.filter(candidate =>
        candidate.profile?.location?.province?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.skills) {
      filtered = filtered.filter(candidate =>
        getSkillNames(candidate.skills)?.some(skill => 
          skill.toLowerCase().includes(filters.skills.toLowerCase())
        )
      );
    }

    if (filters.experience) {
      filtered = filtered.filter(candidate => {
        const totalExperience = calculateTotalExperience(candidate.experience);
        return totalExperience >= parseInt(filters.experience);
      });
    }

    if (filters.minMatchScore > 0) {
      filtered = filtered.filter(candidate => candidate.matchScore >= filters.minMatchScore);
    }

    setFilteredCandidates(filtered);
  };

  // Mock Data
  const getMockCandidates = () => {
    return [
      {
        _id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        profileImage: 'sarah-profile.jpg',
        profile: {
          headline: 'Senior Software Developer',
          location: {
            province: 'Gauteng'
          },
          contact: {
            phone: '+27 82 123 4567'
          }
        },
        skills: [
          { name: 'JavaScript', level: 'expert' },
          { name: 'React', level: 'expert' },
          { name: 'Node.js', level: 'intermediate' },
          { name: 'Python', level: 'intermediate' },
          { name: 'AWS', level: 'beginner' },
          { name: 'MongoDB', level: 'intermediate' }
        ],
        experience: [
          {
            title: 'Senior Developer',
            company: 'Tech Solutions SA',
            startDate: new Date('2020-01-01'),
            current: true,
            description: 'Leading frontend development team and architecting scalable solutions.'
          },
          {
            title: 'Full Stack Developer',
            company: 'Digital Innovations',
            startDate: new Date('2018-03-01'),
            endDate: new Date('2020-01-01'),
            current: false,
            description: 'Developed and maintained web applications using React and Node.js'
          }
        ],
        education: [
          {
            institution: 'University of Cape Town',
            qualification: 'BSc Computer Science',
            field: 'Computer Science',
            year: 2018,
            completed: true
          }
        ],
        stats: {
          careerStats: {
            profileCompletion: 85,
            totalApplications: 12,
            interviews: 4,
            offers: 2
          }
        },
        matchScore: 92,
        isGoodMatch: true
      },
      {
        _id: '2',
        name: 'Mike Chen',
        email: 'mike.chen@example.com',
        profileImage: 'mike-profile.jpg',
        profile: {
          headline: 'Full Stack Developer',
          location: {
            province: 'Western Cape'
          },
          contact: {
            phone: '+27 83 456 7890'
          }
        },
        skills: [
          { name: 'Java', level: 'expert' },
          { name: 'Spring Boot', level: 'expert' },
          { name: 'Angular', level: 'intermediate' },
          { name: 'MySQL', level: 'intermediate' },
          { name: 'Docker', level: 'beginner' },
          { name: 'Kubernetes', level: 'beginner' }
        ],
        experience: [
          {
            title: 'Full Stack Developer',
            company: 'Digital Innovations',
            startDate: new Date('2019-03-01'),
            current: true,
            description: 'Building enterprise applications with microservices architecture'
          }
        ],
        education: [
          {
            institution: 'Stellenbosch University',
            qualification: 'BEng Computer Engineering',
            field: 'Computer Engineering',
            year: 2019,
            completed: true
          }
        ],
        stats: {
          careerStats: {
            profileCompletion: 78,
            totalApplications: 8,
            interviews: 3,
            offers: 1
          }
        },
        matchScore: 87,
        isGoodMatch: true
      },
      {
        _id: '3',
        name: 'Amanda Peters',
        email: 'amanda.p@example.com',
        profileImage: 'amanda-profile.jpg',
        profile: {
          headline: 'Frontend Developer',
          location: {
            province: 'Gauteng'
          },
          contact: {
            phone: '+27 84 987 6543'
          }
        },
        skills: [
          { name: 'React', level: 'expert' },
          { name: 'TypeScript', level: 'intermediate' },
          { name: 'CSS', level: 'expert' },
          { name: 'Vue.js', level: 'beginner' },
          { name: 'SASS', level: 'intermediate' },
          { name: 'Webpack', level: 'intermediate' }
        ],
        experience: [
          {
            title: 'Frontend Developer',
            company: 'Web Creations',
            startDate: new Date('2021-06-01'),
            current: true,
            description: 'Creating responsive web interfaces and improving user experience'
          }
        ],
        education: [
          {
            institution: 'Wits University',
            qualification: 'BSc IT',
            field: 'Information Technology',
            year: 2021,
            completed: true
          }
        ],
        stats: {
          careerStats: {
            profileCompletion: 72,
            totalApplications: 5,
            interviews: 2,
            offers: 0
          }
        },
        matchScore: 76,
        isGoodMatch: false
      }
    ];
  };

  // Effects
  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    filterCandidates();
  }, [candidates, searchTerm, filters]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Finding the best candidates for you...</p>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                  <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Find Candidates
                  </h1>
                </div>
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-sm lg:text-lg mt-2 max-w-2xl">
            Discover talented professionals perfectly matched to your requirements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Search and Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 mb-8 hover:shadow-lg transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10 transition-colors group-hover:text-green-600" />
                      <input
                        type="text"
                        placeholder="Search by name, skills, or headline..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-12 w-full bg-white/80 backdrop-blur-sm border-0 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="relative input-field w-full bg-white/80 backdrop-blur-sm border-0 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  >
                    <option value="">All Locations</option>
                    <option value="Gauteng">Gauteng</option>
                    <option value="Western Cape">Western Cape</option>
                    <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                    <option value="Eastern Cape">Eastern Cape</option>
                    <option value="Limpopo">Limpopo</option>
                    <option value="Mpumalanga">Mpumalanga</option>
                    <option value="North West">North West</option>
                    <option value="Free State">Free State</option>
                    <option value="Northern Cape">Northern Cape</option>
                  </select>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <select
                    value={filters.minMatchScore}
                    onChange={(e) => setFilters({...filters, minMatchScore: parseInt(e.target.value)})}
                    className="relative input-field w-full bg-white/80 backdrop-blur-sm border-0 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                  >
                    <option value="0">All Match Scores</option>
                    <option value="80">80%+ Match</option>
                    <option value="70">70%+ Match</option>
                    <option value="60">60%+ Match</option>
                    <option value="50">50%+ Match</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Candidates List */}
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    Potential Candidates
                  </h2>
                  <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    {filteredCandidates.length}
                  </span>
                </div>
                <button className="group flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 rounded-xl hover:border-green-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 w-full sm:w-auto justify-center">
                  <Download className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <span className="font-medium">Export List</span>
                </button>
              </div>

              <div className="space-y-6">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => {
                    const isSaved = savedStatus[candidate._id] || false;
                    
                    return (
                      <CandidateCard
                        key={candidate._id}
                        candidate={candidate}
                        isSaved={isSaved}
                        isExpanded={expandedCandidate === candidate._id}
                        isHovered={hoveredCard === candidate._id}
                        isContacting={contactingCandidate === candidate._id}
                        onViewProfile={viewCandidateProfile}
                        onContact={contactCandidate}
                        onSaveProfile={saveCandidateProfile}
                        onToggleExpand={toggleCandidateExpansion}
                        onMouseEnter={() => setHoveredCard(candidate._id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        getImageUrl={getImageUrl}
                        getSkillNames={getSkillNames}
                        formatDate={formatDate}
                        calculateTotalExperience={calculateTotalExperience}
                      />
                    );
                  })
                ) : (
                  <NoCandidatesFound 
                    searchTerm={searchTerm}
                    filters={filters}
                    onClearFilters={() => {
                      setSearchTerm('');
                      setFilters({ location: '', skills: '', experience: '', minMatchScore: 0 });
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Quick Stats */}
          <div className="lg:col-span-1">
            <StatsSidebar 
              candidates={candidates}
              calculateTotalExperience={calculateTotalExperience}
              getSkillNames={getSkillNames}
            />
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
        `}
      </style>
    </div>
  );
};

// Sub Components
const CandidateCard = ({ 
  candidate, 
  isSaved, 
  isExpanded, 
  isHovered, 
  isContacting,
  onViewProfile,
  onContact,
  onSaveProfile,
  onToggleExpand,
  onMouseEnter,
  onMouseLeave,
  getImageUrl,
  getSkillNames,
  formatDate,
  calculateTotalExperience
}) => {

  const getSkillName = (skill) => {
    if (typeof skill === 'string') return skill;
    if (skill && typeof skill === 'object' && skill.name) return skill.name;
    return 'Unknown Skill';
  };

  const getLevelBars = (level) => {
    const levels = {
      beginner: 2,
      intermediate: 3,
      expert: 5
    };
    return levels[level] || 3;
  };

  return (
    <div 
      className={`relative bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden transition-all duration-500 transform hover:-translate-y-1 hover:shadow-xl ${
        isExpanded ? 'ring-2 ring-green-500/20' : ''
      } ${isHovered ? 'shadow-lg' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : ''
      }`}></div>
      
      <div className="relative p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start space-x-4 flex-1">
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-16 h-16 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 transform group-hover:scale-105 transition-transform duration-300 overflow-hidden">
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
                  {candidate.name?.charAt(0).toUpperCase()}
                </div>
                {candidate.isGoodMatch && (
                  <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1 shadow-lg">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-3 mb-3">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 truncate hover:text-green-700 transition-colors duration-200">
                  {candidate.name}
                </h3>
                {candidate.isGoodMatch && (
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg transform hover:scale-105 transition-transform duration-200">
                    <Star className="h-3 w-3 fill-current" />
                    <span>Top Match</span>
                  </div>
                )}
                <div className={`px-3 py-1 rounded-full text-sm font-semibold shadow-md transform hover:scale-105 transition-transform duration-200 ${
                  candidate.matchScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
                  candidate.matchScore >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' :
                  'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                }`}>
                  {candidate.matchScore}% Match
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 text-lg font-medium">{candidate.profile?.headline || 'Skilled Professional'}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {getSkillNames(candidate.skills)?.slice(0, 4).map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="inline-block bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 border border-gray-300/50"
                  >
                    {skill}
                  </span>
                ))}
                {candidate.skills?.length > 4 && (
                  <span className="inline-block bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium">
                    +{candidate.skills.length - 4} more
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {candidate.profile?.location?.province && (
                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{candidate.profile.location.province}</span>
                  </div>
                )}
                {candidate.experience?.length > 0 && (
                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{candidate.experience.length} position(s)</span>
                  </div>
                )}
                {candidate.education?.length > 0 && (
                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">{candidate.education.length} degree(s)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
            <button
              onClick={() => onViewProfile(candidate._id)}
              className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg justify-center font-semibold"
            >
              <Eye className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>View Profile</span>
            </button>
            <button
              onClick={() => onContact(candidate._id, candidate.email, candidate.name)}
              disabled={isContacting}
              className={`group flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg justify-center font-semibold ${
                isContacting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
              }`}
            >
              <Mail className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>
                {isContacting ? 'Opening...' : 'Contact'}
              </span>
            </button>
            <button
              onClick={() => onSaveProfile(candidate._id, candidate.name)}
              className={`group flex items-center space-x-2 px-6 py-3 border rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg justify-center font-semibold ${
                isSaved 
                  ? 'bg-yellow-500 border-yellow-500 text-white hover:bg-yellow-600 hover:border-yellow-600' 
                  : 'bg-white border-gray-300 text-gray-700 hover:border-green-600'
              }`}
              title={isSaved ? 'Remove from saved profiles' : 'Save candidate profile'}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''} transition-transform group-hover:scale-110`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button
              onClick={() => onToggleExpand(candidate._id)}
              className="group flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg justify-center font-semibold"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 transition-transform group-hover:scale-110" />
              ) : (
                <ChevronDown className="h-4 w-4 transition-transform group-hover:scale-110" />
              )}
              <span>Details</span>
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-8 pt-8 border-t border-gray-200/50 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Experience */}
              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-3 text-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <span>Experience</span>
                </h4>
                {candidate.experience?.length > 0 ? (
                  <div className="space-y-4">
                    {candidate.experience.slice(0, 3).map((exp, index) => (
                      <div key={index} className="bg-gray-50/50 rounded-xl p-4 hover:bg-gray-50 transition-colors duration-200">
                        <div className="font-semibold text-gray-900 text-lg">{exp.title}</div>
                        <div className="text-gray-600 font-medium">{exp.company}</div>
                        <div className="text-gray-500 text-sm mt-1">
                          {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                        </div>
                        {exp.description && (
                          <p className="text-gray-600 mt-2 text-sm leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm bg-gray-50/50 rounded-xl p-4">No experience listed</p>
                )}
              </div>

              {/* Education */}
              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-3 text-lg">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <span>Education</span>
                </h4>
                {candidate.education?.length > 0 ? (
                  <div className="space-y-4">
                    {candidate.education.slice(0, 3).map((edu, index) => (
                      <div key={index} className="bg-gray-50/50 rounded-xl p-4 hover:bg-gray-50 transition-colors duration-200">
                        <div className="font-semibold text-gray-900 text-lg">{edu.qualification}</div>
                        <div className="text-gray-600 font-medium">{edu.institution}</div>
                        <div className="text-gray-500 text-sm mt-1">
                          {edu.field && `${edu.field} • `}{edu.year}
                          {edu.completed !== undefined && (
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                              edu.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {edu.completed ? 'Completed' : 'In Progress'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm bg-gray-50/50 rounded-xl p-4">No education listed</p>
                )}
              </div>
            </div>

            {/* Skills with Levels */}
            <div className="mt-8">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-3 text-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <span>Skills & Proficiency</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidate.skills?.slice(0, 8).map((skill, index) => {
                  const skillName = getSkillName(skill);
                  const skillLevel = skill.level || 'intermediate';
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300 transform hover:-translate-y-0.5">
                      <span className="font-semibold text-gray-700">{skillName}</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <div
                              key={star}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                star <= getLevelBars(skillLevel)
                                  ? 'bg-yellow-500 shadow-sm'
                                  : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-gray-500 capitalize px-2 py-1 bg-white rounded-full border">
                          {skillLevel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                <div className="font-bold text-2xl text-green-600">
                  {candidate.stats?.careerStats?.totalApplications || 0}
                </div>
                <div className="text-gray-600 font-medium">Applications</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                <div className="font-bold text-2xl text-blue-600">
                  {candidate.stats?.careerStats?.interviews || 0}
                </div>
                <div className="text-gray-600 font-medium">Interviews</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                <div className="font-bold text-2xl text-purple-600">
                  {candidate.stats?.careerStats?.offers || 0}
                </div>
                <div className="text-gray-600 font-medium">Offers</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NoCandidatesFound = ({ searchTerm, filters, onClearFilters }) => (
  <div className="card p-12 text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50">
    <Users className="h-20 w-20 text-gray-400 mx-auto mb-6" />
    <h3 className="text-2xl font-bold text-gray-900 mb-3">No candidates found</h3>
    <p className="text-gray-600 text-lg mb-6">
      {searchTerm || Object.values(filters).some(f => f) 
        ? 'Try adjusting your search criteria or filters'
        : 'No candidates available at the moment'
      }
    </p>
    <button
      onClick={onClearFilters}
      className="bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
    >
      Clear Filters
    </button>
  </div>
);

const StatsSidebar = ({ candidates, calculateTotalExperience, getSkillNames }) => {
  const skillCounts = {};
  candidates.forEach(candidate => {
    getSkillNames(candidate.skills)?.forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 sticky top-24 hover:shadow-lg transition-all duration-300">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
        <TrendingUp className="h-5 w-5 text-green-600" />
        <span>Candidate Insights</span>
      </h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Total Candidates</span>
            <span className="text-xl font-bold text-green-600">{candidates.length}</span>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Good Matches</span>
            <span className="text-xl font-bold text-blue-600">
              {candidates.filter(c => c.isGoodMatch).length}
            </span>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Avg. Experience</span>
            <span className="text-xl font-bold text-purple-600">
              {candidates.length > 0 
                ? (candidates.reduce((sum, c) => sum + calculateTotalExperience(c.experience), 0) / candidates.length).toFixed(1)
                : '0'
              } years
            </span>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Avg. Profile Score</span>
            <span className="text-xl font-bold text-orange-600">
              {candidates.length > 0 
                ? (candidates.reduce((sum, c) => sum + (c.stats?.careerStats?.profileCompletion || 0), 0) / candidates.length).toFixed(0)
                : '0'
              }%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center space-x-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <span>Top Skills in Pool</span>
        </h4>
        <div className="space-y-3">
          {Object.entries(skillCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([skill, count]) => (
              <div key={skill} className="flex justify-between items-center p-2 bg-gray-50/50 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <span className="text-sm font-medium text-gray-700">{skill}</span>
                <span className="font-bold text-green-600 bg-white px-2 py-1 rounded-full text-xs border">
                  {count}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Candidates;