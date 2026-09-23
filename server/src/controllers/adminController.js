const User          = require('../models/User');
const Visitor       = require('../models/Visitor');
const LocationEvent = require('../models/LocationEvent');
const Verification  = require('../models/Verification');
const ShortLink     = require('../models/ShortLink');

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalVisitors, totalLocations, totalVerifications, totalLinks, activeLinks] = await Promise.all([
      User.countDocuments({ role: 'USER' }),
      Visitor.countDocuments(),
      LocationEvent.countDocuments({ consent: true }),
      Verification.countDocuments({ faceDetected: true }),
      ShortLink.countDocuments(),
      ShortLink.countDocuments({ isActive: true }),
    ]);

    const totalClicks = await ShortLink.aggregate([
      { $group: { _id: null, total: { $sum: '$clicks' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalVisitors,
        totalLocations,
        totalVerifications,
        totalLinks,
        activeLinks,
        totalClicks: totalClicks[0]?.total || 0,
      },
    });
  } catch (err) { next(err); }
};

// GET /api/admin/visitors
const getVisitors = async (req, res, next) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: visitors });
  } catch (err) { next(err); }
};

// GET /api/admin/locations
const getLocations = async (req, res, next) => {
  try {
    const locations = await LocationEvent.find({ consent: true }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: locations });
  } catch (err) { next(err); }
};

// GET /api/admin/verifications
const getVerifications = async (req, res, next) => {
  try {
    const verifications = await Verification.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: verifications });
  } catch (err) { next(err); }
};

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'USER' }).select('-passwordHash').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

module.exports = { getStats, getVisitors, getLocations, getVerifications, getUsers };
