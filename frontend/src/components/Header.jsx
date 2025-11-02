import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { messagesAPI } from '../api/apiClient.js';
import { 
  Search, 
  Menu, 
  X, 
  Briefcase, 
  User, 
  MapPin, 
  Bell, 
  MessageCircle,
  FileText,
  Users,
  Clock,
  Eye,
  Settings,
  LogOut,
  Building,
  PlusCircle,
  List,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  Home,
  BarChart3,
  Bookmark,
  BookmarkCheck 
} from 'lucide-react';
import getImageUrl from '../utils/imageUrl';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDropdown, setHoveredDropdown] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch header data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchHeaderData();
    }
  }, [isAuthenticated, user]);

  // Close search and dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchExpanded(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setHoveredDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchHeaderData = async () => {
    try {
      setLoading(true);
      
      const conversationsResponse = await messagesAPI.getConversations();
      const conversationsData = conversationsResponse.data.conversations || [];
      setConversations(conversationsData.slice(0, 3));

      const realNotifications = generateRealNotifications();
      setNotifications(realNotifications.slice(0, 4));

    } catch (error) {
      console.error('Error fetching header data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRealNotifications = () => {
    if (user?.role === 'employer') {
      return [
        { 
          id: 1, 
          type: 'application',
          title: 'New Application Received',
          message: 'Sarah Johnson applied for Senior React Developer',
          time: '2 hours ago',
          read: false,
          icon: Users,
          color: 'text-green-500',
          bgColor: 'bg-green-500'
        },
        { 
          id: 2, 
          type: 'job_approval',
          title: 'Job Post Approved',
          message: 'Frontend Developer post is now live',
          time: '1 day ago',
          read: true,
          icon: FileText,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500'
        },
        { 
          id: 3, 
          type: 'profile_view',
          title: 'Profile Viewed',
          message: 'Your company profile was viewed by candidates',
          time: '2 days ago',
          read: false,
          icon: Eye,
          color: 'text-purple-500',
          bgColor: 'bg-purple-500'
        },
        { 
          id: 4, 
          type: 'deadline_reminder',
          title: 'Deadline Approaching',
          message: 'Data Scientist position expires in 3 days',
          time: '3 days ago',
          read: true,
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500'
        }
      ];
    } else {
      return [
        { 
          id: 1, 
          type: 'application_submitted',
          title: 'Application Submitted',
          message: 'Senior React Developer at Tech Solutions SA',
          time: '2 hours ago',
          read: false,
          icon: FileText,
          color: 'text-green-500',
          bgColor: 'bg-green-500'
        },
        { 
          id: 2, 
          type: 'job_match',
          title: 'New Job Match',
          message: 'Frontend Developer position matches your profile',
          time: '1 day ago',
          read: true,
          icon: Briefcase,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500'
        },
        { 
          id: 3, 
          type: 'profile_reminder',
          title: 'Complete Your Profile',
          message: 'Add skills and experience for better matches',
          time: '2 days ago',
          read: false,
          icon: User,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500'
        },
        { 
          id: 4, 
          type: 'profile_view',
          title: 'Profile Viewed',
          message: 'Employer viewed your profile',
          time: '3 days ago',
          read: true,
          icon: Eye,
          color: 'text-purple-500',
          bgColor: 'bg-purple-500'
        }
      ];
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (user?.role === 'employer') {
        navigate(`/employer/candidates?search=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
      }
      setIsSearchExpanded(false);
    }
  };

  const handleFindCandidatesClick = () => {
    if (user?.role === 'employer') {
      navigate('/employer/candidates');
    } else {
      navigate('/jobs');
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const provinces = ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape'];

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const unreadMessagesCount = conversations.filter(c => c.unreadCount > 0).length;

  const formatTime = (timeString) => {
    return timeString;
  };

  const getParticipantDisplay = (conversation) => {
    if (conversation.participant) {
      return conversation.participant;
    }
    return {
      name: 'Unknown User',
      avatar: 'UU'
    };
  };

  // Dropdown Item Component
  const DropdownItem = ({ icon: Icon, label, onClick, href, isHighlight = false, badge }) => {
    const content = (
      <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 group ${
        isHighlight 
          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700' 
          : 'text-gray-700 hover:text-green-600 hover:bg-green-600/10'
      }`}>
        <div className="flex items-center space-x-3">
          <Icon className={`h-4 w-4 ${isHighlight ? 'text-white' : 'text-current'}`} />
          <span className="font-medium">{label}</span>
        </div>
        {badge && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isHighlight 
              ? 'bg-white/20 text-white' 
              : 'bg-green-600 text-white'
          }`}>
            {badge}
          </span>
        )}
        <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${
          isHighlight ? 'text-white' : 'text-gray-400 group-hover:text-green-600 group-hover:translate-x-1'
        }`} />
      </div>
    );

    if (href) {
      return (
        <Link to={href} onClick={onClick}>
          {content}
        </Link>
      );
    }

    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-green-600/20' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-500 shadow-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
            </div>
            <div className="transform group-hover:scale-105 transition-transform duration-300">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-800 bg-clip-text text-transparent">
                JobConnect
              </h1>
              <p className="text-xs text-gray-600 -mt-1 flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>South Africa</span>
              </p>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8" ref={searchRef}>
            <div className="relative w-full">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Search className="h-5 w-5 text-green-600 group-hover:text-blue-800 transition-colors duration-300" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-12 pr-32 py-4 border-2 border-green-600/20 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all duration-300 hover:border-green-600/40"
                      placeholder={user?.role === 'employer' ? "Search candidates by skills, location..." : "Search jobs in Johannesburg, Cape Town..."}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-1">
                      <select className="h-full pl-3 pr-8 border-l border-gray-300 bg-transparent text-sm text-gray-600 focus:outline-none rounded-r-2xl hover:text-green-600 transition-colors duration-300">
                        <option>All SA</option>
                        {provinces.map(province => (
                          <option key={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2" ref={dropdownRef}>
            <button
              onClick={handleFindCandidatesClick}
              className="flex items-center space-x-1 text-gray-700 hover:text-green-600 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-green-600/10 group"
            >
              <MapPin className="h-4 w-4" />
              <span>{user?.role === 'employer' ? 'Find Candidates' : 'Find Jobs'}</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {/* Notifications Dropdown */}
                <div 
                  className="relative group"
                  onMouseEnter={() => setHoveredDropdown('notifications')}
                  onMouseLeave={() => setHoveredDropdown(null)}
                >
                  <Link
                    to="/notifications"
                    className="p-3 text-gray-600 hover:text-green-600 hover:bg-green-600/10 rounded-2xl transition-all duration-300 relative flex items-center transform hover:scale-110"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-600 rounded-full border-2 border-white text-xs text-white flex items-center justify-center font-medium shadow-lg animate-pulse">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </Link>
                  
                  <div className={`absolute top-full right-0 mt-2 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-green-600/20 transition-all duration-300 transform ${
                    hoveredDropdown === 'notifications' 
                      ? 'opacity-100 visible translate-y-0' 
                      : 'opacity-0 invisible translate-y-2'
                  }`}>
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900 flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <Bell className="h-5 w-5 text-green-600" />
                          <span>{user?.role === 'employer' ? 'Employer Notifications' : 'Notifications'}</span>
                        </span>
                        {unreadNotificationsCount > 0 && (
                          <span className="bg-gradient-to-r from-green-600 to-emerald-700 text-white text-xs px-3 py-1 rounded-full font-medium">
                            {unreadNotificationsCount} new
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 cursor-pointer transition-all duration-300 group ${
                              !notification.read ? 'bg-blue-50/50' : ''
                            }`}
                            onClick={() => navigate('/notifications')}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-10 h-10 ${notification.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300`}>
                                <notification.icon className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTime(notification.time)}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p>No notifications yet</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <Link
                        to="/notifications"
                        className="text-center text-sm text-green-600 hover:text-green-700 font-semibold flex items-center justify-center space-x-2"
                        onClick={() => setHoveredDropdown(null)}
                      >
                        <span>View All Notifications</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Messages Dropdown */}
                <div 
                  className="relative group"
                  onMouseEnter={() => setHoveredDropdown('messages')}
                  onMouseLeave={() => setHoveredDropdown(null)}
                >
                  <Link
                    to="/messages"
                    className="p-3 text-gray-600 hover:text-green-600 hover:bg-green-600/10 rounded-2xl transition-all duration-300 relative flex items-center transform hover:scale-110"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {unreadMessagesCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border-2 border-white text-xs text-white flex items-center justify-center font-medium shadow-lg animate-pulse">
                        {unreadMessagesCount}
                      </span>
                    )}
                  </Link>
                  
                  <div className={`absolute top-full right-0 mt-2 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-green-600/20 transition-all duration-300 transform ${
                    hoveredDropdown === 'messages' 
                      ? 'opacity-100 visible translate-y-0' 
                      : 'opacity-0 invisible translate-y-2'
                  }`}>
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900 flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <MessageCircle className="h-5 w-5 text-green-600" />
                          <span>{user?.role === 'employer' ? 'Employer Messages' : 'Messages'}</span>
                        </span>
                        {unreadMessagesCount > 0 && (
                          <span className="bg-gradient-to-r from-green-600 to-emerald-700 text-white text-xs px-3 py-1 rounded-full font-medium">
                            {unreadMessagesCount} unread
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {conversations.length > 0 ? (
                        conversations.map((conversation) => {
                          const participant = getParticipantDisplay(conversation);
                          return (
                            <div 
                              key={conversation._id} 
                              className="p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 cursor-pointer transition-all duration-300 group"
                              onClick={() => navigate('/messages')}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-800 rounded-xl flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300 shadow-lg overflow-hidden">
                                  {getImageUrl(participant.avatar) ? (
                                    <img 
                                      src={getImageUrl(participant.avatar)} 
                                      alt={participant.name} 
                                      className="w-full h-full rounded-xl object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div 
                                    className={`w-full h-full rounded-xl flex items-center justify-center ${getImageUrl(participant.avatar) ? 'hidden' : 'flex'}`}
                                  >
                                    {participant.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                                      {participant.name}
                                    </p>
                                    {conversation.unreadCount > 0 && (
                                      <span className="bg-gradient-to-r from-green-600 to-emerald-700 text-white text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center flex-shrink-0">
                                        {conversation.unreadCount}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {conversation.lastMessage?.content || 'No messages yet'}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTime(conversation.lastActivity)}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p>No conversations yet</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <Link
                        to="/messages"
                        className="text-center text-sm text-green-600 hover:text-green-700 font-semibold flex items-center justify-center space-x-2"
                        onClick={() => setHoveredDropdown(null)}
                      >
                        <span>View All Messages</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* User Menu Dropdown */}
                <div 
                  className="relative group"
                  onMouseEnter={() => setHoveredDropdown('user')}
                  onMouseLeave={() => setHoveredDropdown(null)}
                >
                  <button className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm border border-green-600/20 rounded-2xl px-4 py-2 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                      {getImageUrl(user?.profileImage || user?.profile?.avatar) ? (
                        <img 
                          src={getImageUrl(user?.profileImage || user?.profile?.avatar)} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full rounded-full flex items-center justify-center ${getImageUrl(user?.profileImage || user?.profile?.avatar) ? 'hidden' : 'flex'}`}
                      >
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-600 capitalize flex items-center space-x-1">
                        <span>{user?.role}</span>
                        <ChevronDown className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180" />
                      </p>
                    </div>
                  </button>
                  
                  <div className={`absolute right-0 w-80 mt-2 py-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-green-600/20 transition-all duration-300 transform ${
                    hoveredDropdown === 'user' 
                      ? 'opacity-100 visible translate-y-0' 
                      : 'opacity-0 invisible translate-y-2'
                  }`}>
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                      <p className="text-xs text-green-600 capitalize font-semibold flex items-center space-x-1 mt-1">
                        <Sparkles className="h-3 w-3" />
                        <span>{user?.role}</span>
                      </p>
                    </div>
                    
                    <div className="space-y-1 px-2 py-2">
                      {user?.role === 'candidate' && (
                        <>
                          <DropdownItem 
                            icon={BarChart3} 
                            label="Candidate Dashboard" 
                            href="/candidate/dashboard"
                            onClick={() => setHoveredDropdown(null)}
                          />
                          <DropdownItem 
                            icon={User} 
                            label="My Profile" 
                            href="/profile"
                            onClick={() => setHoveredDropdown(null)}
                          />
                          <DropdownItem 
                            icon={MapPin} 
                            label="Find Jobs" 
                            href="/jobs"
                            onClick={() => setHoveredDropdown(null)}
                          />
                          <DropdownItem 
                            icon={Bookmark} 
                            label="Saved Jobs" 
                            href="/saved-jobs"
                            onClick={() => setHoveredDropdown(null)}
                          />
                        </>
                      )}
                      {user?.role === 'employer' && (
                        <>
                          <DropdownItem 
                            icon={BarChart3} 
                            label="Employer Dashboard" 
                            href="/employer/dashboard"
                            onClick={() => setHoveredDropdown(null)}
                          />
                          <DropdownItem 
                            icon={Building} 
                            label="Company Profile" 
                            href="/employer/profile"
                            onClick={() => setHoveredDropdown(null)}
                          />
                          <DropdownItem 
                            icon={PlusCircle} 
                            label="Post New Job" 
                            href="/employer/jobs/new"
                            onClick={() => setHoveredDropdown(null)}
                          />
                          <DropdownItem 
                            icon={Users} 
                            label="View Applications" 
                            href="/employer/applications"
                            onClick={() => setHoveredDropdown(null)}
                          />
                          <DropdownItem 
                            icon={List} 
                            label="My Job Posts" 
                            href="/employer/all-applications"
                            onClick={() => setHoveredDropdown(null)}
                          />
                          <DropdownItem 
                            icon={BookmarkCheck} 
                            label="Saved Profiles" 
                            href="/saved-profiles"
                            onClick={() => setHoveredDropdown(null)}
                          />
                        </>
                      )}
                      
                      <DropdownItem 
                        icon={Settings} 
                        label="Settings" 
                        href="/settings"
                        onClick={() => setHoveredDropdown(null)}
                      />
                      
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={() => {
                            handleLogout();
                            setHoveredDropdown(null);
                          }}
                          className="flex items-center justify-between w-full p-3 text-red-600 hover:bg-red-600/10 rounded-xl transition-all duration-300 group"
                        >
                          <div className="flex items-center space-x-3">
                            <LogOut className="h-4 w-4" />
                            <span className="font-medium">Sign Out</span>
                          </div>
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-green-600/10 font-medium transform hover:scale-105"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg flex items-center space-x-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>Join Free</span>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="p-3 rounded-2xl text-gray-700 hover:text-green-600 hover:bg-green-600/10 transition-all duration-300 transform hover:scale-110"
            >
              <Search className="h-6 w-6" />
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 rounded-2xl text-gray-700 hover:text-green-600 hover:bg-green-600/10 transition-all duration-300 transform hover:scale-110"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchExpanded && (
          <div className="lg:hidden pb-4" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-20 transition duration-500"></div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Search className="h-5 w-5 text-green-600" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3 border-2 border-green-600/20 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
                    placeholder={user?.role === 'employer' ? "Search candidates by skills..." : "Search jobs..."}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchExpanded(false)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-green-600/20 bg-white/95 backdrop-blur-xl rounded-2xl mt-2 shadow-2xl">
            <div className="flex flex-col space-y-1 px-4">
              <Link
                to="/"
                className="flex items-center space-x-3 text-gray-700 hover:text-green-600 px-4 py-3 rounded-xl hover:bg-green-600/10 transition-all duration-300 text-left"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>

              <button
                onClick={handleFindCandidatesClick}
                className="flex items-center space-x-3 text-gray-700 hover:text-green-600 px-4 py-3 rounded-xl hover:bg-green-600/10 transition-all duration-300 text-left"
              >
                <MapPin className="h-4 w-4" />
                <span>{user?.role === 'employer' ? 'Find Candidates' : 'Find Jobs'}</span>
              </button>

              {isAuthenticated && (
                <>
                  <Link
                    to="/notifications"
                    className="flex items-center space-x-3 text-gray-700 hover:text-green-600 px-4 py-3 rounded-xl hover:bg-green-600/10 transition-all duration-300 relative"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute right-4 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-600 rounded-full text-xs text-white flex items-center justify-center font-medium">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/messages"
                    className="flex items-center space-x-3 text-gray-700 hover:text-green-600 px-4 py-3 rounded-xl hover:bg-green-600/10 transition-all duration-300 relative"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Messages</span>
                    {unreadMessagesCount > 0 && (
                      <span className="absolute right-4 w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                        {unreadMessagesCount}
                      </span>
                    )}
                  </Link>

                  {/* 🔥 ADD: Saved Jobs for Candidate in Mobile Menu */}
                  {user?.role === 'candidate' && (
                    <Link
                      to="/saved-jobs"
                      className="flex items-center space-x-3 text-gray-700 hover:text-green-600 px-4 py-3 rounded-xl hover:bg-green-600/10 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Bookmark className="h-5 w-5" />
                      <span>Saved Jobs</span>
                    </Link>
                  )}

                  {/* 🔥 ADD: Saved Profiles for Employer in Mobile Menu */}
                  {user?.role === 'employer' && (
                    <Link
                      to="/saved-profiles"
                      className="flex items-center space-x-3 text-gray-700 hover:text-green-600 px-4 py-3 rounded-xl hover:bg-green-600/10 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BookmarkCheck className="h-5 w-5" />
                      <span>Saved Profiles</span>
                    </Link>
                  )}
                </>
              )}

              {isAuthenticated ? (
                <>
                  {user?.role === 'candidate' && (
                    <Link
                      to="/candidate/dashboard"
                      className="flex items-center space-x-3 text-gray-700 hover:text-green-600 px-4 py-3 rounded-xl hover:bg-green-600/10 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BarChart3 className="h-5 w-5" />
                      <span>Candidate Dashboard</span>
                    </Link>
                  )}
                  {user?.role === 'employer' && (
                    <>
                      <Link
                        to="/employer/dashboard"
                        className="flex items-center space-x-3 text-gray-700 hover:text-green-600 px-4 py-3 rounded-xl hover:bg-green-600/10 transition-all duration-300"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <BarChart3 className="h-5 w-5" />
                        <span>Employer Dashboard</span>
                      </Link>
                      <Link
                        to="/employer/jobs/new"
                        className="flex items-center space-x-3 text-gray-700 hover:text-green-600 px-4 py-3 rounded-xl hover:bg-green-600/10 transition-all duration-300 bg-gradient-to-r from-green-50 to-blue-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <PlusCircle className="h-5 w-5 text-green-600" />
                        <span>Post New Job</span>
                      </Link>
                      <Link
                        to="/employer/applications"
                        className="flex items-center space-x-3 text-gray-700 hover:text-green-600 px-4 py-3 rounded-xl hover:bg-green-600/10 transition-all duration-300"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Users className="h-5 w-5" />
                        <span>View Applications</span>
                      </Link>
                      <Link
                        to="/employer/all-applications"
                        className="flex items-center space-x-3 text-gray-700 hover:text-green-600 px-4 py-3 rounded-xl hover:bg-green-600/10 transition-all duration-300"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <List className="h-5 w-5" />
                        <span>My Job Posts</span>
                      </Link>
                    </>
                  )}
                  <Link
                    to={user?.role === 'employer' ? '/employer/profile' : '/profile'}
                    className="flex items-center space-x-3 text-gray-700 hover:text-green-600 px-4 py-3 rounded-xl hover:bg-green-600/10 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 text-gray-700 hover:text-green-600 px-4 py-3 rounded-xl hover:bg-green-600/10 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 text-left text-red-600 hover:bg-red-600/10 px-4 py-3 rounded-xl transition-all duration-300"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center space-x-3 text-gray-700 hover:text-green-600 px-4 py-3 rounded-xl hover:bg-green-600/10 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-green-600 to-blue-800 hover:from-blue-800 hover:to-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-center mx-4 flex items-center justify-center space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Zap className="h-4 w-4" />
                    <span>Join Free</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;