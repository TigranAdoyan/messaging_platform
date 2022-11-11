const express = require('express');
const router = express.Router();
const controller = require('../controllers/users');
const auth = require('../middleware/auth');

router.post('/login', controller.login);

router.get('/auth_data', auth, controller.getAuthData);

module.exports = router;
