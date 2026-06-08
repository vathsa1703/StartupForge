const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSessionSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Startup',
      required: true,
    },

    // Used for Persona chats
    personaId: {
      type: String,
      default: null,
    },

    // Used for Investor chats
    investorId: {
      type: String,
      default: null,
    },

    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'ChatSession',
  chatSessionSchema
);