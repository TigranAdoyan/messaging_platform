require('./configuration/events');

const ioSocket = require('socket.io');
const redis = require('redis');
const controllers = require('./controllers');
const {createAdapter} = require('@socket.io/redis-adapter');

module.exports.create = () => {
    const io = new ioSocket.Server();
    io.namespaces = {
        message: 'message'
    };

    const pubClient = redis.createClient({ url: "redis://localhost:6380" });
    const subClient = pubClient.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        io.adapter(createAdapter(pubClient, subClient));
        io.listen(configs.SOCKET_PORT);

        controllers.MessageController.create(io);
    });


    // const ioServer = new ioSocket.Server();
    // ioServer.namespaces = {
    //     message: 'message'
    // };
    //
    // const pubClient = redis.createClient({
    //     url: `${configs.SOCKET_ADAPTER_REDIS_HOST}:${configs.SOCKET_ADAPTER_REDIS_PORT}`,
    // });
    // const subClient = pubClient.duplicate();
    //
    // Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    //     // ioServer.adapter(createAdapter(pubClient, subClient));
    //     ioServer.adapter(createAdapter(pubClient, subClient));
    //
    //     controllers.MessageController.create(ioServer);
    //
    //     ioServer.listen(configs.SOCKET_PORT);
    //     logger.info(`Socket: launched successfully PORT => "${configs.SOCKET_PORT}"`);
    // });
};
