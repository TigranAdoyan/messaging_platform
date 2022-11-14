const nats = require('nats');
const socketMiddleware = require('../middleware');
const plugins = require('../plugins');

module.exports.create = function (ioServer, natsClient) {
    ioServer
        .of(ioServer.namespaces.message)
        .use(socketMiddleware.auth)
        .use(socketMiddleware.session)
        .on('connection', async (socket) => {
            logger.info(`UserId: "${socket.user.id}"; SocketId "${socket.id}" connected`);

            // binding event handlers
            socket.on(socketEvents.client["sync_app"], async () => {
                logger.info(`Socket "${socketEvents.client["sync_app"]} : UserId "${socket.user.id}"`);

                await natsClient.sub(`messenger.sync_data.response.${socket.user.id}`, data => {
                    socket.emit(socketEvents.server["sync_app"], data);
                });

                await natsClient.pub(`messenger.sync_data.request`, {
                    userId: socket.user.id,
                });
            });

            //  socket.on(socketEvents.client["send_message"], (data, cb) => {
            //     // logger.info(`Socket "${socketEvents.client["send_message"]} : UserId "${socket.user.id}"`);
            //     plugins.message.sendMessage(ioServer, socket, data, cb);
            //  });

            //  socket.on(socketEvents.client["seen_message"], (data) => {
            //     logger.info(`Socket "${socketEvents.client["seen_message"]} : UserId "${socket.user.id}"`);
            //     plugins.message.seenMessage(ioServer, socket, data);
            //  });

            //  socket.on(socketEvents.client["typing_status_change"], (data) => {
            //     logger.info(`Socket "${socketEvents.client["typing_status_change"]} : UserId "${socket.user.id}"`);
            //     plugins.message.changeTypingStatus(ioServer, socket, data);
            //  });

            //  socket.on('disconnect', () => {
            //     logger.info(`User id: ${socket.user.id} disconnected`);
            //     plugins.message.changeOnlineStatus(ioServer, socket, 'offline')
            //  });

            //  socket.emit(socketEvents.server["session"], {
            //     sessionID: socket.sessionID,
            //     userID: socket.userID,
            //  });
        })
};