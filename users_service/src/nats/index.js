const nats = require('nats');

const UsersHandler = require('./handlers/users');

module.exports = async function () {
    const client = await nats.connect({
        servers: "localhost",
    });
    const sc = nats.StringCodec();

    client.sub = async function subscribe({topic, wildcard = {}, callback}) {
        const subscription = await this.subscribe(topic);

        (async () => {
            for await (const msg of subscription) {
                try {
                    const payload = {};

                    if (msg.data) {
                        try {
                            payload.data = JSON.parse(msg.data)
                        } catch (e) {
                            payload.data = {}
                        }
                    }

                    if (!_.isEmpty(wildcard)) {
                        const chunks = msg.subject.split('.');

                        Object.keys(wildcard).forEach(key => {
                            payload[key] = chunks[wildcard[key] - 1];
                        });
                    }
                    callback(payload);
                } catch (e) {
                    console.log(e.message);
                    callback();
                }
            }
        })();
    };

    client.pub = async function publish(topic, data) {
        this.publish(topic, sc.encode(JSON.stringify(data)));
    };

    await Promise.all([
        UsersHandler(client),
    ]);
};