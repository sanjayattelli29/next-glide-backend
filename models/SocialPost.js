const mongoose = require('mongoose');

const socialPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false // Optional for migration safety
  },
  caption: {
    type: String,
    required: true
  },
  hashtags: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  scheduledAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Published'],
    default: 'Draft'
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  comments: [{
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isHidden: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SocialPost', socialPostSchema);
