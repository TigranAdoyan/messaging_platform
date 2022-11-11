require('./configuration');
const expressServer = require('./servers/Express');
const socketServer = require('./servers/Socket');

expressServer.create();
socketServer.create();
