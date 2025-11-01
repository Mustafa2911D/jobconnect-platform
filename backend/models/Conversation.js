import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['employer', 'candidate'],
      required: true
    },
    lastRead: {
      type: Date,
      default: Date.now
    }
  }],
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    initiatedAt: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// ===== INDEXES =====
conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ 'metadata.lastActivity': -1 });
conversationSchema.index({ job: 1 });

// ===== INSTANCE METHODS =====
conversationSchema.methods.getOtherParticipant = function(currentUserId) {
  if (!currentUserId) return null;
  
  const currentUserIdStr = currentUserId.toString();
  return this.participants.find(participant => {
    if (!participant || !participant.user) {
      return false;
    }
    
    const participantId = participant.user._id || participant.user.id;
    if (!participantId) {
      return false;
    }
    
    return participantId.toString() !== currentUserIdStr;
  });
};

conversationSchema.methods.getParticipantByRole = function(role) {
  return this.participants.find(participant => participant.role === role);
};

// ===== STATIC METHODS =====
conversationSchema.statics.findOrCreate = async function(participant1, participant2, jobId = null) {
  if (!participant1 || !participant2 || !participant1._id || !participant2._id) {
    throw new Error('Invalid participants provided');
  }

  const participant1Id = participant1._id.toString();
  const participant2Id = participant2._id.toString();

  const participants = [
    { user: participant1Id, role: participant1.role },
    { user: participant2Id, role: participant2.role }
  ].sort((a, b) => a.user.localeCompare(b.user));

  let conversation = await this.findOne({
    $and: [
      { 'participants.user': participant1Id },
      { 'participants.user': participant2Id }
    ],
    isActive: true
  });

  if (!conversation) {
    conversation = await this.create({
      participants,
      job: jobId,
      metadata: {
        initiatedBy: participant1Id,
        initiatedAt: new Date(),
        lastActivity: new Date()
      }
    });
  }

  return conversation;
};

export default mongoose.model('Conversation', conversationSchema);