const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  sessionId:   { type: String, required: true, index: true },
  shortCode:   { type: String, default: null },
  userAgent:   { type: String },
  language:    { type: String },
  timezone:    { type: String },
  screenWidth: { type: Number },
  screenHeight:{ type: Number },
  referrer:    { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
