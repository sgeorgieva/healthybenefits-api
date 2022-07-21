const express = require('express');
const newsletterController = require('./../controllers/newsletterController');

const router = express.Router();

router.route('/subscribe').post(newsletterController.subscribeNewsletter);

module.exports = router;
