const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  url: { type: String, required: true },
  note: { type: String },
  tag: { type: String, default: 'general' },
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Link', linkSchema);
