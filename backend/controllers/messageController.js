import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// ===== CONVERSATION MANAGEMENT =====
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const conversations = await Conversation.find({
      'participants.user': userId,
      isActive: true
    })
    .populate('participants.user', 'name email role profile.avatar company')
    .populate('lastMessage')
    .populate('job', 'title company')
    .sort({ 'metadata.lastActivity': -1 });

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.getUnreadCount(conversation._id, userId);
        
        const otherParticipant = conversation.participants.find(participant => 
          participant.user._id.toString() !== userId.toString()
        );

        if (!otherParticipant || !otherParticipant.user) {
          console.error('Could not find other participant for conversation:', conversation._id);
          return null;
        }

        const participantUser = otherParticipant.user;
        
        return {
          _id: conversation._id,
          participant: {
            _id: participantUser._id,
            name: participantUser.name || 'Unknown User',
            email: participantUser.email,
            role: otherParticipant.role,
            avatar: participantUser.profile?.avatar || participantUser.name?.split(' ').map(n => n[0]).join('').toUpperCase(),
            company: participantUser.company,
            lastActive: conversation.metadata.lastActivity
          },
          job: conversation.job,
          lastMessage: conversation.lastMessage,
          unreadCount,
          lastActivity: conversation.metadata.lastActivity,
          createdAt: conversation.createdAt
        };
      })
    );

    const validConversations = conversationsWithUnread.filter(conv => conv !== null);

    res.json({
      success: true,
      conversations: validConversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
};

export const startConversation = async (req, res) => {
  try {
    const { recipientId, jobId, initialMessage } = req.body;
    const senderId = req.user._id;

    console.log('🔵 Starting conversation - sender:', senderId, 'recipient:', recipientId);

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required'
      });
    }

    if (!senderId) {
      return res.status(400).json({
        success: false,
        message: 'Sender ID is missing'
      });
    }

    if (recipientId === senderId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot start conversation with yourself'
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    console.log('🔵 Found recipient:', recipient.name, 'role:', recipient.role);

    let conversation = await Conversation.findOne({
      $and: [
        { 'participants.user': senderId },
        { 'participants.user': recipientId },
        { isActive: true }
      ]
    })
    .populate('participants.user', 'name email role profile.avatar company')
    .populate('job', 'title company')
    .populate('lastMessage');

    let message = null;
    let isNewConversation = false;

    if (conversation) {
      console.log('🟡 Found existing conversation:', conversation._id);
      
      conversation.metadata.lastActivity = new Date();
      await conversation.save();
      
    } else {
      console.log('🟢 Creating new conversation between:', req.user.name, 'and', recipient.name);
      
      conversation = new Conversation({
        participants: [
          { user: senderId, role: req.user.role },
          { user: recipientId, role: recipient.role }
        ],
        job: jobId,
        metadata: {
          initiatedBy: senderId,
          initiatedAt: new Date(),
          lastActivity: new Date()
        }
      });

      await conversation.save();
      isNewConversation = true;

      await conversation.populate('participants.user', 'name email role profile.avatar company');
      if (jobId) {
        await conversation.populate('job', 'title company');
      }
      
      console.log('🟢 Created conversation:', conversation._id);
    }

    if (initialMessage && initialMessage.trim() && isNewConversation) {
      message = new Message({
        conversation: conversation._id,
        sender: senderId,
        content: initialMessage.trim()
      });
      await message.save();
      await message.populate('sender', 'name email role profile.avatar');

      conversation.lastMessage = message._id;
      conversation.metadata.lastActivity = new Date();
      await conversation.save();
      
      console.log('📝 Created initial message:', message.content);
    }

    await conversation.populate('participants.user', 'name email role profile.avatar company');
    if (conversation.lastMessage && !conversation.populated('lastMessage')) {
      await conversation.populate('lastMessage');
    }

    res.json({
      success: true,
      conversation,
      message,
      isNewConversation
    });
  } catch (error) {
    console.error('❌ Error starting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting conversation: ' + error.message
    });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: conversationId,
        'participants.user': userId
      },
      {
        isActive: false
      },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting conversation'
    });
  }
};

// ===== MESSAGE MANAGEMENT =====
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.user': userId,
      isActive: true
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email role profile.avatar')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId }
      },
      {
        $push: { readBy: { user: userId } },
        status: 'read'
      }
    );

    res.json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total: await Message.countDocuments({ conversation: conversationId })
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, recipientId, content, replyTo } = req.body;
    const senderId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    let conversation;

    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        'participants.user': senderId,
        isActive: true
      });
    } else if (recipientId) {
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({
          success: false,
          message: 'Recipient not found'
        });
      }

      conversation = await Conversation.findOrCreate(req.user, recipient);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either conversationId or recipientId is required'
      });
    }

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const message = new Message({
      conversation: conversation._id,
      sender: senderId,
      content: content.trim(),
      replyTo
    });

    await message.save();
    await message.populate('sender', 'name email role profile.avatar');

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
};

// ===== MESSAGE STATUS MANAGEMENT =====
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.user': userId,
      isActive: true
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId }
      },
      {
        $push: { readBy: { user: userId } },
        status: 'read'
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read'
    });
  }
};
// ===== AVAILABLE USERS FOR MESSAGING =====
export const getAvailableUsers = async (req, res) => {
  try {
    const currentUser = req.user;
    const userRole = currentUser.role;
    
    console.log(`🔍 Fetching available users for ${userRole}: ${currentUser.name}`);

    let availableUsers = [];

    if (userRole === 'employer') {
      // For employers: get candidates who applied to their jobs
      const Application = (await import('../models/Application.js')).default;
      
      // Find applications to the employer's jobs and populate candidate details
      const applications = await Application.find({ 
        'job.employer': currentUser._id 
      })
      .populate('candidate', 'name email role profile profileImage headline')
      .populate('job', 'title employer');
      
      // Extract unique candidates from applications
      const candidateMap = new Map();
      applications.forEach(app => {
        if (app.candidate && app.candidate._id.toString() !== currentUser._id.toString()) {
          candidateMap.set(app.candidate._id.toString(), app.candidate);
        }
      });
      
      availableUsers = Array.from(candidateMap.values());
      console.log(`👥 Found ${availableUsers.length} unique candidates for employer`);

    } else if (userRole === 'candidate') {
      // For candidates: get employers they applied to
      const Application = (await import('../models/Application.js')).default;
      
      // Find applications by the candidate and populate employer details
      const applications = await Application.find({ 
        candidate: currentUser._id 
      })
      .populate({
        path: 'job',
        populate: {
          path: 'employer',
          select: 'name email role profile profileImage company companyProfile'
        }
      });

      // Extract unique employers from applications
      const employerMap = new Map();
      applications.forEach(app => {
        if (app.job && app.job.employer && app.job.employer._id.toString() !== currentUser._id.toString()) {
          employerMap.set(app.job.employer._id.toString(), app.job.employer);
        }
      });
      
      availableUsers = Array.from(employerMap.values());
      console.log(`👥 Found ${availableUsers.length} unique employers for candidate`);

    } else {
      // For other roles 
      availableUsers = [];
    }

    // Format the response
    const formattedUsers = availableUsers.map(user => ({
      _id: user._id,
      name: user.name || 'Unknown User',
      email: user.email,
      role: user.role,
      profile: {
        headline: user.profile?.headline || (user.role === 'employer' ? user.companyProfile?.description || user.company : 'Professional Candidate'),
        avatar: user.profile?.avatar || user.profileImage,
        location: user.profile?.location
      },
      company: user.role === 'employer' ? user.company : undefined,
      lastActive: new Date().toISOString(),
      isOnline: false
    }));

    res.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length
    });

  } catch (error) {
    console.error('❌ Error fetching available users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available users: ' + error.message,
      users: []
    });
  }
};