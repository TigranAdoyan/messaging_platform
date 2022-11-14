const socketMiddleware = require('./middleware');

module.exports.create = function (ioServer, natsClient) {
    ioServer
        .of(ioServer.namespaces.message)
        .use(socketMiddleware.auth)
        // .use(socketMiddleware.session)
        .on('connection', async (socket) => {
            logger.info(`UserId: "${socket.user.id}"; SocketId "${socket.id}" connected`);

            const subscription = await natsClient.sub(`messenger.response.*.${socket.user.id}`, ({data, subject}) => {
                switch (subject.split('.')[2]) {
                    case "sync_data": {
                        socket.emit(socketEvents.server.sync_app, data);
                        break;
                    }
                    case "send_message": {
                        socket.emit(socketEvents.server.send_message, data);
                        break;
                    }
                }
            });

            socket.on(socketEvents.client["sync_app"], async () => {
                await natsClient.pub(`messenger.request.sync_data`, {
                    userId: socket.user.id,
                });
            });

            socket.on(socketEvents.client["send_message"], async () => {
                await natsClient.pub(`messenger.request.send_message`, {
                    userId: socket.user.id
                });
            });

            socket.on('disconnect', async () => {
                subscription.unsubscribe();
                await natsClient.pub(`messenger.request.disconnect`, {
                    userId: socket.user.id,
                });
                logger.info(`UserId: "${socket.user.id}"; SocketId "${socket.id}" disconnected`);
            });

            // socket.emit(socketEvents.server["session"], {
            //     sessionID: socket.sessionID,
            //     userID: socket.userID,
            // });
        })
};