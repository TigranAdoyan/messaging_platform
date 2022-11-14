require('dotenv').config();
require('./override_prototypes');
require('./events');

global.httpCode = require('../cores/HttpError').httpCode;
global.HttpError = require('../cores/HttpError').HttpError;
global.logger = require('../cores/Logger');

global.configs = {
   SOCKET_PORT: parseInt(process.env.SOCKET_PORT),
   JWT_SECRET: process.env.JWT_SECRET,
   AUTH_REDIS_HOST: process.env.AUTH_REDIS_HOST,
   AUTH_REDIS_PORT: parseInt(process.env.AUTH_REDIS_PORT),
   AUTH_REDIS_PASSWORD: process.env.AUTH_REDIS_PASSWORD,
};