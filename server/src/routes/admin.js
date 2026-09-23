const router = require('express').Router();
const { getStats, getVisitors, getLocations, getVerifications, getUsers } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/visitors', getVisitors);
router.get('/locations', getLocations);
router.get('/verifications', getVerifications);
router.get('/users', getUsers);

module.exports = router;
