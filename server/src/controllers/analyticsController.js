const Visitor      = require('../models/Visitor');
const LocationEvent = require('../models/LocationEvent');

// POST /api/analytics/visitor
const saveVisitor = async (req, res, next) => {
  try {
    const { sessionId, shortCode, userAgent, language, timezone, screenWidth, screenHeight, referrer } = req.body;
    await Visitor.findOneAndUpdate(
      { sessionId },
      { sessionId, shortCode, userAgent, language, timezone, screenWidth, screenHeight, referrer },
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ success: true });
  } catch (err) { next(err); }
};

// POST /api/analytics/location
const saveLocation = async (req, res, next) => {
  try {
    const { sessionId, shortCode, latitude, longitude, accuracy, consent } = req.body;
    if (!sessionId || !latitude || !longitude)
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180)
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });

    const event = await LocationEvent.create({ sessionId, shortCode, latitude, longitude, accuracy, consent: consent !== false });
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
};

module.exports = { saveVisitor, saveLocation };
