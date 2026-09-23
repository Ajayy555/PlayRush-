const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, trim: true },
  role:         { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  profilePhoto: { type: String, default: null }, // base64
  location: {
    latitude:  { type: Number, default: null },
    longitude: { type: Number, default: null },
    accuracy:  { type: Number, default: null },
  },
  sessionId: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Userp', userSchema);
