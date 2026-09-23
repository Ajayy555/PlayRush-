const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { uploadToCloudinary } = require('../services/cloudinaryService');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
// Body: { username, profilePhoto, location, sessionId }
const register = async (req, res, next) => {
  try {
    const { username, profilePhoto, location, sessionId } = req.body;
    if (!username || username.trim().length < 2)
      return res.status(400).json({ success: false, message: 'Username required (min 2 chars)' });

    const exists = await User.findOne({ username: username.trim() });
    if (exists)
      return res.status(409).json({ success: false, message: 'Username already taken' });

    // Upload photo to Cloudinary (returns CDN URL or base64 fallback)
    const photoUrl = await uploadToCloudinary(profilePhoto);

    const user = await User.create({
      username: username.trim(),
      profilePhoto: photoUrl,
      location: location || {},
      sessionId: sessionId || null,
    });

    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      data: {
        token,
        user: { _id: user._id, username: user.username, role: user.role, profilePhoto: user.profilePhoto },
      },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/login — supports admin (email/username + password from .env) and players (username)
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username)
      return res.status(400).json({ success: false, message: 'Username or Admin Email required' });

    const trimmed = username.trim().toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@playrush.com').toLowerCase();
    const adminPass  = process.env.ADMIN_PASSWORD || 'Admin@123';

    // Check if logging in as Admin
    if (trimmed === adminEmail || trimmed === 'playrush_admin' || trimmed === 'admin') {
      if (!password) {
        return res.status(400).json({ success: false, message: 'Admin password is required' });
      }
      if (password !== adminPass) {
        return res.status(401).json({ success: false, message: 'Incorrect Admin password' });
      }

      let admin = await User.findOne({ role: 'ADMIN' });
      if (!admin) {
        admin = await User.create({ username: 'playrush_admin', role: 'ADMIN' });
      }

      const token = signToken(admin._id);
      return res.json({
        success: true,
        data: {
          token,
          user: { _id: admin._id, username: admin.username, role: admin.role, profilePhoto: admin.profilePhoto },
        },
      });
    }

    // Regular player login by username
    const user = await User.findOne({ username: new RegExp(`^${username.trim()}$`, 'i') });
    if (!user)
      return res.status(404).json({ success: false, message: 'Player not found. Please register first.' });

    const token = signToken(user._id);
    res.json({
      success: true,
      data: {
        token,
        user: { _id: user._id, username: user.username, role: user.role, profilePhoto: user.profilePhoto },
      },
    });
  } catch (err) { next(err); }
};

// GET /api/auth/me
const me = async (req, res) => {
  res.json({ success: true, data: req.user });
};

module.exports = { register, login, me };
