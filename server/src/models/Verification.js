const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  sessionId:        { type: String, required: true, index: true },
  faceDetected:     { type: Boolean, default: false },
  faceCount:        { type: Number, default: 0 },
  cameraPermission: { type: Boolean, default: false },
  verifiedAt:       { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Verification', verificationSchema);
