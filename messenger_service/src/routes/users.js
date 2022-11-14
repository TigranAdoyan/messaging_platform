const express = require('express');
const router = express.Router();
const controller = require('../controllers/users');

router.post('/login', controller.login);

router.post('/auth_info', controller.authInfo);

module.exports = router;
