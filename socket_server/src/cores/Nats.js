const { connect, StringCodec } = require('nats');

(async function () {
   const natsClient = await connect({
      servers: "localhost"
   });
   const sc = StringCodec();

   const sub = await natsClient.subscribe('sync.response.1');

   (async () => {
      for await (const m of sub) {
         // console.log(`[${sub.getProcessed()}]: ${sc.decode(m.data)}`);
         console.log(JSON.parse(sc.decode(m.data)));
      }
      console.log("subscription closed");
   })();

   natsClient.publish('sync.request.1', sc.encode(JSON.stringify({
      userId: 1
   })));

   // await natsClient.drain();
})();

