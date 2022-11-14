const socketMiddleware = require('../../middleware');
const plugins = require('../../cores/plugins');

module.exports.create = function (ioServer) {
   ioServer
       .of(ioServer.namespaces.message)
       .use(socketMiddleware.auth)
       .use(socketMiddleware.session)
       .on('connection', async (socket) => {
          logger.info(`UserId: "${socket.user.id}"; SocketId "${socket.id}" connected`);

          // binding event handlers
          socket.on(socketEvents.client["sync_app"], () => {
             logger.info(`Socket "${socketEvents.client["sync_app"]} : UserId "${socket.user.id}"`);
             plugins.message.syncApp(ioServer, socket);
             plugins.message.changeOnlineStatus(ioServer, socket, 'online');
          });

          socket.on(socketEvents.client["send_message"], (data, cb) => {
             // logger.info(`Socket "${socketEvents.client["send_message"]} : UserId "${socket.user.id}"`);
             plugins.message.sendMessage(ioServer, socket, data, cb);
          });

          socket.on(socketEvents.client["seen_message"], (data) => {
             logger.info(`Socket "${socketEvents.client["seen_message"]} : UserId "${socket.user.id}"`);
             plugins.message.seenMessage(ioServer, socket, data);
          });

          socket.on(socketEvents.client["typing_status_change"], (data) => {
             logger.info(`Socket "${socketEvents.client["typing_status_change"]} : UserId "${socket.user.id}"`);
             plugins.message.changeTypingStatus(ioServer, socket, data);
          });

          socket.on('disconnect', () => {
             logger.info(`User id: ${socket.user.id} disconnected`);
             plugins.message.changeOnlineStatus(ioServer, socket, 'offline')
          });

          socket.emit(socketEvents.server["session"], {
             sessionID: socket.sessionID,
             userID: socket.userID,
          });
       })
};