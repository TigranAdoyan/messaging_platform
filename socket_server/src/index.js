require('./configuration');
const ioSocket = require('socket.io');
const nats = require('nats');
const http = require('http');
const redis = require('redis');
const controllers = require('./controllers');
const {createAdapter} = require('@socket.io/redis-adapter');

(async function () {
   const httpServer = http.createServer();

   const natsClient = await nats.connect({
      servers: "localhost"
   });
   const sc = nats.StringCodec();

   natsClient.sub = async function (topic, callback) {
      const syncSubscription = this.subscribe(topic);

      (async () => {
         for await (const m of syncSubscription) {
            callback(JSON.parse(sc.decode(m.data)));
         }
      })();
   };

   natsClient.pub = async function (topic, data) {
      await this.publish(topic, sc.encode(JSON.stringify(data)));
   };

   const ioServer = new ioSocket.Server(httpServer);
   ioServer.namespaces = {
      message: 'message'
   };

   const pubClient = redis.createClient({ url: "redis://localhost:6381" });
   const subClient = pubClient.duplicate();

   Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      ioServer.adapter(createAdapter(pubClient, subClient));

      httpServer.listen(configs.SOCKET_PORT, () => {
         logger.info(`'Socket server running successfully PORT:${configs.SOCKET_PORT}'`)
      });
   
      controllers.MessageController.create(ioServer, natsClient);
   });
})();