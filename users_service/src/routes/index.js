const router = require('express').Router();

const usersRouter = require('./users');

router.use('/user', usersRouter);

module.exports = router;
