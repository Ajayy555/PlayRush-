const router = require('express').Router();
const { createLink, getLinks } = require('../controllers/linksController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createLink);
router.get('/', protect, adminOnly, getLinks);

module.exports = router;
