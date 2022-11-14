require('./configuration');
const nats = require('nats');
const Handler = require('./handler');

(async function () {
    const client = await nats.connect({
        servers: "localhost"
    });
    const sc = nats.StringCodec();

    client.sub = async function (topic, callback) {
        const syncSubscription = this.subscribe(topic);

        (async () => {
            for await (const m of syncSubscription) {
                callback(m ? JSON.parse(sc.decode(m.data)) : {}, m.subject);
            }
        })();
    };

    client.pub = async function (topic, data = {}) {
        await this.publish(topic, sc.encode(JSON.stringify(data)));
    };

    const handler = new Handler(client);

    await client.sub('messenger.request.*', (data, subject) => {
        const key = subject.split('.')[2];

        if (typeof handler[key] === 'function') {
            handler[key](data);
        }
    });

    logger.info('Nats Client initialized successfully !');
})();
