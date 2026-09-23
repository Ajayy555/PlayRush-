const router = require('express').Router();
const { saveVerification } = require('../controllers/verificationController');

router.post('/', saveVerification);

module.exports = router;
