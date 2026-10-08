const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    default: 'Saved Link',
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  domain: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    trim: true
  },
  tag: {
    type: String,
    default: 'general'
  },
  clicks: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
});

module.exports = mongoose.model('Link', linkSchema);