require('dotenv').config();
require('./override_prototypes');

global.httpCode = require('../cores/HttpError').httpCode;
global.HttpError = require('../cores/HttpError').HttpError;
global.logger = require('../cores/Logger');

global.configs = {
   EXPRESS_PORT: parseInt(process.env.EXPRESS_PORT),
   SOCKET_PORT: parseInt(process.env.SOCKET_PORT),
   JWT_SECRET: process.env.JWT_SECRET,
   GENERAL_REDIS_HOST: process.env.GENERAL_REDIS_HOST,
   GENERAL_REDIS_PORT: parseInt(process.env.GENERAL_REDIS_PORT),
   GENERAL_REDIS_PASSWORD: process.env.GENERAL_REDIS_PASSWORD,
   SOCKET_ADAPTER_REDIS_HOST: process.env.SOCKET_ADAPTER_REDIS_HOST,
   SOCKET_ADAPTER_REDIS_PORT: parseInt(process.env.SOCKET_ADAPTER_REDIS_PORT),
   SOCKET_ADAPTER_REDIS_PASSWORD: process.env.SOCKET_ADAPTER_REDIS_PASSWORD,
   // REDIS_CLUSTER: [
   //    {
   //       host: process.env.REDIS_CLUSTER_NODE_1_HOST,
   //       port: process.env.REDIS_CLUSTER_NODE_1_PORT
   //    },
   //    {
   //       host: process.env.REDIS_CLUSTER_NODE_2_HOST,
   //       port: process.env.REDIS_CLUSTER_NODE_2_PORT
   //    },
   //    {
   //       host: process.env.REDIS_CLUSTER_NODE_3_HOST,
   //       port: process.env.REDIS_CLUSTER_NODE_3_PORT
   //    },
   // ],
   MONGO_MESSENGER_URL: process.env.MONGO_MESSENGER_URL,
   MYSQL: {
      DURAK: {
         host: process.env.MYSQL_MESSENGER_HOST,
         port: parseInt(process.env.MYSQL_MESSENGER_PORT),
         database: process.env.MYSQL_MESSENGER_DATABASE,
         user: process.env.MYSQL_MESSENGER_USER,
         password: process.env.MYSQL_MESSENGER_PASSWORD
      }
   },
};

global.MysqlMessengerClients = require('../mysql/messenger');
global.RedisClients = require('../cores/Redis');
global.MongoClients = require('../mongo/messenger');