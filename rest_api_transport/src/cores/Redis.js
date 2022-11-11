const ioRedis = require('ioredis');

const dbs = {
    auth_users: 0,
    messengerSession: 1,
};

class RedisClient {
    constructor(db) {

        this.client = ioRedis.createClient({
            host: configs.GENERAL_REDIS_HOST,
            port: configs.GENERAL_REDIS_PORT,
            db: dbs[db]
        });

        this.client.on('connect', () => {
            logger.info(`Redis: connected successfully "${db}"`);
        });

        this.client.on('error', (e) => {
            logger.error(`Redis: connection error "${db}" ${e.message}`)
        })
    }

    get(field) {
        return this.client.get(field);
    }
}

module.exports.auth = new RedisClient('auth_users');
module.exports.messengerSession = new RedisClient('messengerSession');
