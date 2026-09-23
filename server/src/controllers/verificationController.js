const Verification = require('../models/Verification');

// POST /api/verification
const saveVerification = async (req, res, next) => {
  try {
    const { sessionId, faceDetected, faceCount, cameraPermission } = req.body;
    const v = await Verification.create({
      sessionId,
      faceDetected: !!faceDetected,
      faceCount: faceCount || 0,
      cameraPermission: !!cameraPermission,
      verifiedAt: faceDetected ? new Date() : null,
    });
    res.json({ success: true, data: v });
  } catch (err) { next(err); }
};

module.exports = { saveVerification };
