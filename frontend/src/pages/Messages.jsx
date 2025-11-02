import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { messagesAPI } from '../api/apiClient.js';
import { 
  MessageCircle, Send, Search, Building, User, Briefcase, Calendar, Plus, Loader, Info, Menu, X,
  MoreVertical, Paperclip, Smile, Mic, Video, Phone, Star, Shield, Clock, Check, CheckCheck,
  Edit, Trash2, Download, Share, Pin, Archive, Filter, Users, Zap, Sparkles
} from 'lucide-react';
import { showToast } from '../utils/toast.js';
import socketService from '../utils/socketService.js';
import getImageUrl from '../../utils/imageUrl';

const Messages = () => {
  // Authentication & Routing
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State Management
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOptions, setShowOptions] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Modal & Filter State
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchUsersQuery, setSearchUsersQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    unreadOnly: false,
    pinnedOnly: false,
    dateRange: 'all',
    userType: 'all'
  });
  
  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const isProcessingNavigationRef = useRef(false);

  // Effects - Screen Size & Responsive Behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobileView(mobile);
      if (mobile && selectedConversation) {
        setShowConversations(false);
      } else {
        setShowConversations(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [selectedConversation]);

  // Effects - Scroll Management
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current) {
        setIsScrolled(messagesContainerRef.current.scrollTop > 50);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [selectedConversation]);

  // Effects - Data Loading & Socket Setup
  useEffect(() => {
    if (!authLoading && user) {
      loadConversations();
      setupSocketListeners();
    }
  }, [user, authLoading]);

  useEffect(() => {
  const processNavigationState = async () => {
    if (isProcessingNavigationRef.current || !location.state?.startNewChat || !user) return;

    isProcessingNavigationRef.current = true;
    const { recipientId, recipientName } = location.state;
    
    try {
      window.history.replaceState({}, document.title);
      await handleNewChat(recipientId, recipientName);
    } catch (error) {
      console.error('Error processing navigation state:', error);
    } finally {
      setTimeout(() => {
        isProcessingNavigationRef.current = false;
      }, 1000);
    }
  };

  processNavigationState();
}, [location.state, user]);

  useEffect(() => {
    const handleNewMessage = (data) => {
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setMessages(prev => [...prev, {
          _id: Date.now().toString(),
          content: data.message,
          sender: { _id: data.senderId, name: data.senderName },
          createdAt: new Date().toISOString(),
          status: 'delivered'
        }]);
      }
      loadConversations();
    };

    socketService.onNewMessage(handleNewMessage);
    return () => socketService.off('new-message', handleNewMessage);
  }, [selectedConversation]);

  // Socket Functions
  const setupSocketListeners = () => {
    socketService.onNewMessage((data) => {
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setMessages(prev => [...prev, {
          _id: Date.now().toString(),
          content: data.message,
          sender: { _id: data.senderId },
          createdAt: new Date().toISOString(),
          status: 'delivered'
        }]);
      }
      loadConversations();
    });

    socketService.onApplicationStatusUpdated((data) => {
      if (data.type === 'APPLICATION_STATUS_UPDATED') {
        showToast(`Application update: ${data.message}`, 'info');
        loadConversations();
        if (selectedConversation) loadMessages(selectedConversation._id);
      }
    });
  };

  // API Functions
  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getConversations();
      const uniqueConversations = response.data.conversations || [];
      setConversations(uniqueConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      showToast('Error loading conversations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setLoadingMessages(true);
      const response = await messagesAPI.getMessages(conversationId);
      setMessages(response.data.messages || []);
      
      await messagesAPI.markAsRead(conversationId);
      
      setConversations(prev => prev.map(conv => 
        conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ));

      if (isMobileView) setShowConversations(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      showToast('Error loading messages', 'error');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Chat Management Functions
  const handleNewChatClick = () => {
    setShowNewChatModal(true);
    loadAvailableUsers();
  };

  const loadAvailableUsers = async () => {
  try {
    setLoadingUsers(true);
    
    const response = await messagesAPI.getAvailableUsers();
    
    if (response.data.success) {
      // Filter out current user and ensure we have valid users
      const availableUsers = response.data.users.filter(userItem => 
        userItem && userItem._id && userItem._id !== (user._id || user.id) 
      );
      
      setAvailableUsers(availableUsers);
      console.log(`✅ Loaded ${availableUsers.length} available users`);
    } else {
      throw new Error(response.data.message || 'Failed to load users');
    }
  } catch (error) {
    console.error('❌ Error loading available users:', error);
    
    // Fallback: use existing conversations
    const usersFromConversations = conversations.map(conv => ({
      _id: conv.participant._id,
      name: conv.participant.name,
      email: conv.participant.email,
      role: conv.participant.role,
      company: conv.participant.company,
      avatar: conv.participant.avatar,
      headline: conv.participant.headline,
      profile: {
        headline: conv.participant.headline,
        avatar: conv.participant.avatar
      }
    }));
    
    const uniqueUsers = usersFromConversations.filter((userItem, index, self) =>
      index === self.findIndex(u => u._id === userItem._id) && 
      userItem._id !== (user._id || user.id)
    );
    
    setAvailableUsers(uniqueUsers);
    showToast('Using existing contacts. Some users may not be available.', 'info');
  } finally {
    setLoadingUsers(false);
  }
};

  const handleStartNewChat = async (recipient) => {
  try {
    console.log('🟡 Starting new chat with recipient:', {
      recipientId: recipient._id,
      recipientName: recipient.name,
      recipientRole: recipient.role,
      currentUser: user._id,
      currentUserRole: user.role
    });
    
    setShowNewChatModal(false);
    await handleNewChat(recipient._id, recipient.name);
  } catch (error) {
    console.error('❌ Error starting new chat:', error);
    showToast('Error starting new chat: ' + error.message, 'error');
  }
};

  const searchAvailableUsers = async (query) => {
  setSearchUsersQuery(query);
  
  // If no query, reload all available users
  if (!query.trim()) {
    loadAvailableUsers();
    return;
  }
  
  // Client-side filtering for now since we don't have a dedicated search endpoint
  const filtered = availableUsers.filter(userItem =>
    userItem.name?.toLowerCase().includes(query.toLowerCase()) ||
    userItem.email?.toLowerCase().includes(query.toLowerCase()) ||
    userItem.company?.toLowerCase().includes(query.toLowerCase()) ||
    userItem.profile?.headline?.toLowerCase().includes(query.toLowerCase())
  );
  
  setAvailableUsers(filtered);
};

  // Filter Functions
  const handleFilterClick = () => setShowFilterModal(true);

  const applyFilters = () => {
    setShowFilterModal(false);
    showToast('Filters applied', 'success');
  };

  const clearFilters = () => {
    setFilterOptions({
      unreadOnly: false,
      pinnedOnly: false,
      dateRange: 'all',
      userType: 'all'
    });
    setShowFilterModal(false);
    showToast('Filters cleared', 'info');
  };

  // Core Chat Functions
  const handleNewChat = useCallback(async (recipientId, recipientName) => {
  if (!user || !recipientId) {
    showToast('Recipient information is missing', 'error');
    return;
  }

  try {
    const existingConversation = conversations.find(conv => 
      conv.participant && conv.participant._id === recipientId
    );

    if (existingConversation) {
      setSelectedConversation(existingConversation);
      await loadMessages(existingConversation._id);
      showToast('Conversation opened');
      return;
    }

    const response = await messagesAPI.startConversation({
      recipientId: recipientId,
      initialMessage: `Hello! I'd like to connect with you about potential opportunities.`
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to start conversation');
    }

    const { conversation, message, isNewConversation } = response.data;
    
    if (!conversation) {
      throw new Error('No conversation returned from server');
    }

    const formattedConversation = await createFormattedConversation(
      conversation, 
      recipientId, 
      recipientName, 
      message
    );

    setConversations(prev => {
      const exists = prev.some(conv => conv._id === formattedConversation._id);
      if (exists) return prev;
      return [formattedConversation, ...prev];
    });

    setSelectedConversation(formattedConversation);
    
    if (message) {
      setMessages([message]);
    } else {
      await loadMessages(conversation._id);
    }
    
    showToast(isNewConversation ? 'Conversation started successfully' : 'Conversation opened');

  } catch (error) {
    console.error('Error in handleNewChat:', error);
    showToast(`Error starting conversation: ${error.message}`, 'error');
  }
}, [conversations, user]);

  const createFormattedConversation = async (conversation, recipientId, recipientName, message) => {
  let participantData = null;
  
  if (conversation.participants && conversation.participants.length > 0) {
    const otherParticipant = conversation.participants.find(p => {
      const participantId = p.user?._id || p.user?.id;
      const currentUserId = user?._id || user?.id;
      return participantId && participantId.toString() !== currentUserId?.toString();
    });
    
    if (otherParticipant?.user) {
      participantData = {
        _id: otherParticipant.user._id || otherParticipant.user.id,
        name: otherParticipant.user.name,
        email: otherParticipant.user.email,
        role: otherParticipant.role,
        avatar: otherParticipant.user.profile?.avatar || 
               otherParticipant.user.name?.split(' ').map(n => n[0]).join('').toUpperCase(),
        company: otherParticipant.user.company,
        lastActive: 'Online',
        isVerified: otherParticipant.user.isVerified || false
      };
    }
  }

  if (!participantData) {
    participantData = {
      _id: recipientId,
      name: recipientName,
      email: '',
      role: 'candidate',
      avatar: recipientName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
      company: '',
      lastActive: 'Online',
      isVerified: false
    };
  }

  return {
    _id: conversation._id,
    participant: participantData,
    lastMessage: conversation.lastMessage ? {
      content: conversation.lastMessage.content,
      createdAt: conversation.lastMessage.createdAt
    } : (message ? {
      content: message.content,
      createdAt: message.createdAt
    } : null),
    unreadCount: 0,
    lastActivity: conversation.metadata?.lastActivity || new Date().toISOString(),
    createdAt: conversation.createdAt || new Date().toISOString(),
    isPinned: false
  };
};

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage || !user) return;

    try {
      setSendingMessage(true);
      
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        content: newMessage,
        sender: { _id: user._id || user.id, name: user.name },
        createdAt: new Date().toISOString(),
        status: 'sending'
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      const messageData = { conversationId: selectedConversation._id, content: newMessage };
      const response = await messagesAPI.sendMessage(messageData);
      
      if (!response.data.success) throw new Error(response.data.message || 'Failed to send message');
      const sentMessage = response.data.message;

      setMessages(prev => prev.map(msg => 
        msg._id === tempMessage._id ? { ...sentMessage, status: 'sent' } : msg
      ));
      
      setConversations(prev => prev.map(conv => 
        conv._id === selectedConversation._id ? { 
          ...conv, 
          lastMessage: { content: newMessage, createdAt: new Date().toISOString() },
          lastActivity: new Date().toISOString()
        } : conv
      ));

      showToast('Message sent', 'success');
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg._id !== `temp-${Date.now()}`));
      showToast(`Error sending message: ${error.message}`, 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleConversationSelect = async (conversation) => {
    setSelectedConversation(conversation);
    setShowOptions(null);
    await loadMessages(conversation._id);
  };

  // UI Helper Functions
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    else if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    else if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    else return date.toLocaleDateString();
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    return isToday 
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const isMyMessage = (message) => {
    if (!message || !message.sender || !user) return false;
    const senderId = message.sender._id || message.sender.id;
    const currentUserId = user._id || user.id;
    return senderId === currentUserId;
  };

  const isSystemMessage = (message) => message.messageType === 'system';

  const getParticipantDisplay = (conversation) => 
    conversation.participant || {
      name: 'Unknown User',
      role: 'user',
      avatar: 'UU',
      lastActive: 'Unknown',
      isVerified: false
    };

  const getLastMessagePreview = (conversation) => {
    if (conversation.lastMessage?.content) {
      const content = conversation.lastMessage.content;
      return content.length > 50 ? content.substring(0, 50) + '...' : content;
    }
    return 'No messages yet';
  };

  const getFilteredConversations = () => {
    let filtered = conversations;
    
    if (searchQuery) {
      filtered = filtered.filter(conv => {
        const participant = getParticipantDisplay(conv);
        return participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               participant.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    if (activeFilter === 'unread') filtered = filtered.filter(conv => conv.unreadCount > 0);
    else if (activeFilter === 'pinned') filtered = filtered.filter(conv => conv.isPinned);
    
    if (filterOptions.unreadOnly) filtered = filtered.filter(conv => conv.unreadCount > 0);
    if (filterOptions.pinnedOnly) filtered = filtered.filter(conv => conv.isPinned);
    if (filterOptions.userType !== 'all') {
      filtered = filtered.filter(conv => getParticipantDisplay(conv).role === filterOptions.userType);
    }
    
    if (filterOptions.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(conv => {
        const lastActivity = new Date(conv.lastActivity);
        const diffDays = (now - lastActivity) / (1000 * 60 * 60 * 24);
        
        switch (filterOptions.dateRange) {
          case 'today': return diffDays <= 1;
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          default: return true;
        }
      });
    }
    
    return filtered;
  };

  const cleanConversations = conversations.reduce((acc, current) => {
    const exists = acc.find(conv => conv._id === current._id);
    if (!exists) acc.push(current);
    return acc;
  }, []);

  const handleBackToConversations = () => {
    setShowConversations(true);
    setSelectedConversation(null);
    setShowOptions(null);
  };

  const togglePinConversation = (conversationId, e) => {
    e?.stopPropagation();
    setConversations(prev => prev.map(conv => 
      conv._id === conversationId ? { ...conv, isPinned: !conv.isPinned } : conv
    ));
  };

  const getMessageStatusIcon = (message) => {
    if (message.status === 'sending') return <Clock className="h-3 w-3 text-gray-400" />;
    else if (message.status === 'sent') return <Check className="h-3 w-3 text-gray-400" />;
    else if (message.status === 'delivered') return <CheckCheck className="h-3 w-3 text-green-600" />;
    else if (message.status === 'read') return <CheckCheck className="h-3 w-3 text-blue-800" />;
    return null;
  };

  const handleFileUpload = () => fileInputRef.current?.click();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) showToast('File upload feature coming soon!', 'info');
  };

  // Loading & Authentication States
  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
            <MessageCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Authentication Required</h3>
          <p className="text-gray-600 mb-6 text-lg">
            Please log in to access your messages and continue conversations.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const filteredConversations = getFilteredConversations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 hero-pattern">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageCircle className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-white">{cleanConversations.length}</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 text-glow">Messages</h1>
                <p className="text-gray-600">
                  {user?.role === 'employer' 
                    ? 'Communicate with candidates and manage hiring conversations' 
                    : 'Connect with employers and track applications'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleFilterClick}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 hover:shadow-lg hover:border-green-300 hover:text-green-700"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
              <button 
                onClick={handleNewChatClick}
                className="btn-primary flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>New Chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* Messages Layout */}
        <div className="card rounded-3xl overflow-hidden border border-white/40">
          <div className="grid grid-cols-1 lg:grid-cols-4 h-[80vh] min-h-[700px] max-h-[90vh]">
            
            {/* Conversations Sidebar */}
            <div className={`lg:col-span-1 border-r border-gray-200 flex flex-col ${
              isMobileView && !showConversations ? 'hidden' : 'block'
            }`}>
              
              {/* Search & Filters */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="input-field w-full pl-10 pr-4"
                  />
                </div>
                
                {/* Filter Tabs */}
                <div className="flex space-x-2">
                  {['all', 'unread', 'pinned'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                        activeFilter === filter
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-white/80 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Conversations List */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader className="h-6 w-6 text-green-600 animate-spin" />
                    </div>
                  ) : filteredConversations.length > 0 ? (
                    <div className="space-y-2 p-3">
                      {filteredConversations.map((conversation) => (
                        <ConversationItem 
                          key={conversation._id}
                          conversation={conversation}
                          selectedConversation={selectedConversation}
                          onSelect={handleConversationSelect}
                          onPin={togglePinConversation}
                          showOptions={showOptions}
                          setShowOptions={setShowOptions}
                          getParticipantDisplay={getParticipantDisplay}
                          getLastMessagePreview={getLastMessagePreview}
                          formatTime={formatTime}
                          getImageUrl={getImageUrl}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations</h3>
                      <p className="text-gray-600 text-sm">
                        {searchQuery ? 'No matches found' : 'Start a new conversation to begin'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className={`lg:col-span-3 flex flex-col ${
              isMobileView && showConversations ? 'hidden' : 'block'
            }`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className={`flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 transition-all duration-300 ${
                    isScrolled ? 'bg-white/95 backdrop-blur-sm' : 'bg-white'
                  }`}>
                    <div className="flex items-center space-x-4">
                      {isMobileView && (
                        <button
                          onClick={handleBackToConversations}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-800 rounded-xl flex items-center justify-center text-white font-semibold shadow-md overflow-hidden">
                          {getImageUrl(getParticipantDisplay(selectedConversation).avatar) ? (
                            <img 
                              src={getImageUrl(getParticipantDisplay(selectedConversation).avatar)} 
                              alt={getParticipantDisplay(selectedConversation).name} 
                              className="w-full h-full rounded-xl object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-full h-full rounded-xl flex items-center justify-center ${getImageUrl(getParticipantDisplay(selectedConversation).avatar) ? 'hidden' : 'flex'}`}
                          >
                            {getParticipantDisplay(selectedConversation).name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {getParticipantDisplay(selectedConversation).name}
                        </h3>
                        <p className="text-green-600 text-sm font-medium">
                          {getParticipantDisplay(selectedConversation).lastActive}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200">
                        <Video className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200">
                        <Phone className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200">
                        <Info className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Layout Container */}
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* Messages Container - FIXED HEIGHT WITH SCROLL */}
                    <div 
                      ref={messagesContainerRef}
                      className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50/30"
                      style={{ 
                        minHeight: '0',
                        maxHeight: 'calc(100vh - 280px)'
                      }}
                    >
                      {loadingMessages ? (
                        <div className="flex justify-center items-center h-full">
                          <div className="text-center">
                            <Loader className="h-8 w-8 text-green-600 animate-spin mx-auto mb-2" />
                            <p className="text-gray-600">Loading messages...</p>
                          </div>
                        </div>
                      ) : messages.length > 0 ? (
                        <div className="space-y-4 p-4 lg:p-6 pb-20">
                          {messages.map((message) => {
                            const isMyMsg = isMyMessage(message);
                            const isSystemMsg = isSystemMessage(message);
                            
                            if (isSystemMsg) {
                              return (
                                <div key={message._id} className="flex justify-center">
                                  <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-2xl max-w-md shadow-sm">
                                    <div className="flex items-center space-x-2">
                                      <Info className="h-4 w-4 text-blue-600" />
                                      <p className="text-blue-800 text-sm">{message.content}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            
                            return (
                              <div
                                key={message._id}
                                className={`flex ${isMyMsg ? 'justify-end' : 'justify-start'} group animate-fade-in`}
                              >
                                <div className={`flex items-end space-x-3 max-w-[75%] ${
                                  isMyMsg ? 'flex-row-reverse space-x-reverse' : ''
                                }`}>
                                  {!isMyMsg && (
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-sm overflow-hidden">
                                      {getImageUrl(getParticipantDisplay(selectedConversation).avatar) ? (
                                        <img 
                                          src={getImageUrl(getParticipantDisplay(selectedConversation).avatar)} 
                                          alt={getParticipantDisplay(selectedConversation).name} 
                                          className="w-full h-full rounded-lg object-cover"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <div 
                                        className={`w-full h-full rounded-lg flex items-center justify-center ${getImageUrl(getParticipantDisplay(selectedConversation).avatar) ? 'hidden' : 'flex'}`}
                                      >
                                        {getParticipantDisplay(selectedConversation).avatar.charAt(0)}
                                      </div>
                                    </div>
                                  )}
                                  <div
                                    className={`relative px-4 py-3 rounded-2xl transition-all duration-200 shadow-sm ${
                                      isMyMsg
                                        ? 'bg-gradient-to-r from-green-600 to-blue-800 text-white rounded-br-md'
                                        : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                                    } group-hover:shadow-lg`}
                                  >
                                    <p className="break-words text-sm lg:text-base leading-relaxed">{message.content}</p>
                                    <div className={`flex items-center justify-end space-x-2 mt-1 ${
                                      isMyMsg ? 'text-green-100' : 'text-gray-500'
                                    }`}>
                                      <span className="text-xs">
                                        {formatMessageTime(message.createdAt)}
                                      </span>
                                      {isMyMsg && getMessageStatusIcon(message)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      ) : (
                        <div className="flex justify-center items-center h-full">
                          <div className="text-center max-w-md mx-auto p-8">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                              <Sparkles className="h-10 w-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Start the conversation</h3>
                            <p className="text-gray-600 mb-6">
                              Send your first message to {getParticipantDisplay(selectedConversation).name}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message Input - FIXED POSITION */}
                    <div className="border-t border-gray-200 bg-white/95 backdrop-blur-sm p-4 lg:p-6 sticky bottom-0 z-10">
                      <div className="max-w-4xl mx-auto">
                        <div className="flex items-end space-x-3">
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                              onClick={handleFileUpload}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200"
                            >
                              <Paperclip className="h-5 w-5" />
                            </button>
                            <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200">
                              <Smile className="h-5 w-5" />
                            </button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileSelect}
                              className="hidden"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                          </div>
                          <div className="flex-1 relative">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="input-field w-full resize-none min-h-[60px] max-h-[120px]"
                          rows={1}
                          disabled={sendingMessage}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                        />
                      </div>
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="btn-primary flex items-center space-x-2"
                      >
                        {sendingMessage ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        <span>Send</span>
                      </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
                  <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Select a conversation</h3>
                    <p className="text-gray-600 text-lg mb-6">
                      Choose a conversation from the sidebar to start messaging
                    </p>
                    <div className="card p-6">
                      <p className="text-sm text-green-600 mb-4">💡 <strong>Quick tips:</strong></p>
                      <ul className="text-xs text-gray-600 space-y-2 text-left">
                        <li>• Keep messages professional and concise</li>
                        <li>• Use search to find specific conversations</li>
                        <li>• Pin important conversations for quick access</li>
                        <li>• Respond promptly to maintain engagement</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {user?.role === 'employer' ? 'Start Chat with Candidates' : 'Start Chat with Employers'}
                </h3>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchUsersQuery}
                  onChange={(e) => searchAvailableUsers(e.target.value)}
                  placeholder={
                    user?.role === 'employer' 
                      ? "Search candidates by name, skills, or location..." 
                      : "Search employers by name, company, or industry..."
                  }
                  className="input-field w-full pl-10 pr-4"
                />
              </div>
              
              {/* Role filter for employers viewing candidates */}
              {user?.role === 'employer' && availableUsers.length > 0 && (
                <div className="mt-3 flex space-x-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => loadAvailableUsers()}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded-full whitespace-nowrap"
                  >
                    All Candidates
                  </button>
                  <button
                    onClick={() => {
                      const filtered = availableUsers.filter(userItem => userItem.role === 'candidate');
                      setAvailableUsers(filtered);
                    }}
                    className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full whitespace-nowrap hover:bg-gray-300"
                  >
                    Active Seekers
                  </button>
                </div>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto p-4">
              {loadingUsers ? (
                <div className="flex justify-center items-center py-8">
                  <Loader className="h-6 w-6 text-green-600 animate-spin" />
                </div>
              ) : availableUsers.length > 0 ? (
                <div className="space-y-3">
                  {availableUsers.map((userItem) => (
                    <div
                      key={userItem._id}
                      onClick={() => handleStartNewChat(userItem)}
                      className="flex items-center space-x-3 p-3 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                        {getImageUrl(userItem.avatar) ? (
                          <img 
                            src={getImageUrl(userItem.avatar)} 
                            alt={userItem.name} 
                            className="w-full h-full rounded-lg object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-full rounded-lg flex items-center justify-center ${getImageUrl(userItem.avatar) ? 'hidden' : 'flex'}`}
                        >
                          {userItem.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate group-hover:text-green-700">
                          {userItem.name}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          {userItem.role === 'employer' ? userItem.company : userItem.headline || userItem.email}
                        </p>
                        {userItem.role === 'candidate' && userItem.headline && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {userItem.headline}
                          </p>
                        )}
                      </div>
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        userItem.role === 'employer' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {userItem.role}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    {searchUsersQuery ? 'No users found' : 'No available users to chat with'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {user?.role === 'employer' 
                      ? 'Candidates will appear here when they apply to your jobs' 
                      : 'Employers will appear here when you apply to their jobs'}
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full animate-scale-in">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Filter Conversations</h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Unread Only */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Unread conversations only</label>
                <input
                  type="checkbox"
                  checked={filterOptions.unreadOnly}
                  onChange={(e) => setFilterOptions(prev => ({ ...prev, unreadOnly: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-600"
                />
              </div>
              
              {/* Pinned Only */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Pinned conversations only</label>
                <input
                  type="checkbox"
                  checked={filterOptions.pinnedOnly}
                  onChange={(e) => setFilterOptions(prev => ({ ...prev, pinnedOnly: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-600"
                />
              </div>
              
              {/* User Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">User Type</label>
                <select
                  value={filterOptions.userType}
                  onChange={(e) => setFilterOptions(prev => ({ ...prev, userType: e.target.value }))}
                  className="input-field w-full"
                >
                  <option value="all">All Users</option>
                  <option value="employer">Employers</option>
                  <option value="candidate">Candidates</option>
                </select>
              </div>
              
              {/* Date Range */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Last Activity</label>
                <select
                  value={filterOptions.dateRange}
                  onChange={(e) => setFilterOptions(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="input-field w-full"
                >
                  <option value="all">Any Time</option>
                  <option value="today">Today</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                </select>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex space-x-3">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-800 text-white rounded-xl hover:from-blue-800 hover:to-green-600 transition-all duration-200"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

// Conversation Item Component
const ConversationItem = ({ 
  conversation, 
  selectedConversation, 
  onSelect, 
  onPin, 
  showOptions, 
  setShowOptions,
  getParticipantDisplay,
  getLastMessagePreview,
  formatTime,
  getImageUrl
}) => {
  const participant = getParticipantDisplay(conversation);
  
  return (
    <div
      onClick={() => onSelect(conversation)}
      className={`card relative p-4 cursor-pointer transition-all duration-300 group border ${
        selectedConversation?._id === conversation._id
          ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-lg'
          : conversation.unreadCount > 0
          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
          : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
      } ${conversation.isPinned ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`}
    >
      {conversation.isPinned && (
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
          <Pin className="h-4 w-4 text-yellow-500 fill-current" />
        </div>
      )}

      <div className="flex items-start space-x-3">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-800 rounded-xl flex items-center justify-center text-white font-semibold shadow-md overflow-hidden">
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
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-green-700 transition-colors duration-200">
              {participant.name}
            </h3>
            <div className="flex items-center space-x-2">
              {conversation.unreadCount > 0 && (
                <span className="bg-green-600 text-white text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center flex-shrink-0 animate-pulse shadow-sm">
                  {conversation.unreadCount}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptions(showOptions === conversation._id ? null : conversation._id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-green-600 transition-all duration-200"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <p className="text-green-600 text-sm truncate capitalize mb-1 font-medium">
            {participant.role === 'employer' ? participant.company : participant.role}
          </p>
          <p className="text-gray-600 text-sm truncate mb-2 leading-relaxed">
            {getLastMessagePreview(conversation)}
          </p>
          
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {formatTime(conversation.lastActivity)}
            </p>
            {conversation.lastMessage && (
              <CheckCheck className="h-3 w-3 text-green-600" />
            )}
          </div>
        </div>
      </div>

      {/* Options dropdown */}
      {showOptions === conversation._id && (
        <div className="absolute right-2 top-12 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-2 min-w-[120px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin(conversation._id, e);
              setShowOptions(null);
            }}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <Pin className={`h-4 w-4 ${conversation.isPinned ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
            <span>{conversation.isPinned ? 'Unpin' : 'Pin'}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOptions(null);
            }}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <Archive className="h-4 w-4 text-gray-400" />
            <span>Archive</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Messages;