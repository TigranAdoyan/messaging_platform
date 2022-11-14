require('./configuration');
const ioSocket = require('socket.io');
const redis = require('redis');
const nats = require('nats');
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
const handler = require('./handler');
const { setupMaster, setupWorker } = require("@socket.io/sticky");
const { createAdapter: createClusterAdapter, setupPrimary } = require("@socket.io/cluster-adapter");
const { createAdapter: createRedisAdapter }  = require('@socket.io/redis-adapter');

if (cluster.isMaster) {
   console.log(`Master ${process.pid} is running`);

   const httpServer = http.createServer();

   setupMaster(httpServer, {
      loadBalancingMethod: "least-connection", // either "random", "round-robin" or "least-connection"
   });

   setupPrimary();

   httpServer.listen(configs.SOCKET_PORT);

   for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
   }

   cluster.on("exit", (worker) => {
      console.log(`Worker ${worker.process.pid} died`);
      cluster.fork();
   });
} else {
   console.log(`Worker ${process.pid} started`);

   (async function () {
   const httpServer = http.createServer();

   const natsClient = await nats.connect({
      servers: "localhost"
   });
   const sc = nats.StringCodec();

   natsClient.sub = async function (topic, callback) {
      const subscription = this.subscribe(topic);

      (async () => {
         for await (const m of subscription) {
            callback({
               data: JSON.parse(sc.decode(m.data)),
               subject: m.subject
            });
         }
      })();

      return subscription;
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
      ioServer.adapter(createRedisAdapter(pubClient, subClient));

      setupWorker(ioServer);
      // httpServer.listen(configs.SOCKET_PORT, () => {
      //    logger.info(`'Socket server running successfully PORT:${configs.SOCKET_PORT}'`)
      // });

      handler.create(ioServer, natsClient);
   });
})();

   // const httpServer = http.createServer();
   // const io = new socketIo.Server(httpServer);
   // io.adapter(createAdapter());
   // setupWorker(io);
   //
   // io.on("connection", (socket) => {
   //    /* ... */
   // });
}

// require('./configuration');
// const ioSocket = require('socket.io');
// const nats = require('nats');
// const http = require('http');
// const redis = require('redis');
// const handler = require('./handler');
// const {createAdapter} = require('@socket.io/redis-adapter');
//
// (async function () {
//    const httpServer = http.createServer();
//
//    const natsClient = await nats.connect({
//       servers: "localhost"
//    });
//    const sc = nats.StringCodec();
//
//    natsClient.sub = async function (topic, callback) {
//       const subscription = this.subscribe(topic);
//
//       (async () => {
//          for await (const m of subscription) {
//             callback({
//                data: JSON.parse(sc.decode(m.data)),
//                subject: m.subject
//             });
//          }
//       })();
//
//       return subscription;
//    };
//
//    natsClient.pub = async function (topic, data) {
//       await this.publish(topic, sc.encode(JSON.stringify(data)));
//    };
//
//    const ioServer = new ioSocket.Server(httpServer);
//    ioServer.namespaces = {
//       message: 'message'
//    };
//
//    const pubClient = redis.createClient({ url: "redis://localhost:6381" });
//    const subClient = pubClient.duplicate();
//
//    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
//       ioServer.adapter(createAdapter(pubClient, subClient));
//
//       httpServer.listen(configs.SOCKET_PORT, () => {
//          logger.info(`'Socket server running successfully PORT:${configs.SOCKET_PORT}'`)
//       });
//
//       handler.create(ioServer, natsClient);
//    });
// })();