const mongoose = require('mongoose');

const shortLinkSchema = new mongoose.Schema({
  code:           { type: String, required: true, unique: true, index: true },
  destinationUrl: { type: String, required: true },
  campaignName:   { type: String, default: '' },
  isActive:       { type: Boolean, default: true },
  expiresAt:      { type: Date, default: null },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  clicks:         { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('ShortLink', shortLinkSchema);
