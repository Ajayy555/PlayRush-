const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  shortCode: { type: String, default: null },
  latitude:  { type: Number, required: true },
  longitude: { type: Number, required: true },
  accuracy:  { type: Number },
  consent:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('LocationEvent', locationSchema);
