const ioRedis = require('ioredis');

module.exports = (function createRedisClient() {
    const host = configs.REDIS_HOST;
    const port = configs.REDIS_PORT;

    const client = ioRedis.createClient({
        host,
        port
    });

    client.on('connect', () => {
        logger.info(`Redis: connected successfully "${host}:${port}"`);
    });

    client.on('error', (e) => {
        logger.error(`Redis: connection error "${host}:${port}" ${e.message}`)
    });

    return client;
})();