const router = require('express').Router();
const { saveVisitor, saveLocation } = require('../controllers/analyticsController');

router.post('/visitor', saveVisitor);
router.post('/location', saveLocation);

module.exports = router;
