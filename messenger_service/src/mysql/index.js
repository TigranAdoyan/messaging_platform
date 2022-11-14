const knex = require('knex');
const User = require('./user');

const connection = (function createMysqlConnection() {
    const connection = knex({
        client: 'mysql2',
        connection: {
            host: configs.MYSQL.host,
            port: configs.MYSQL.port,
            database: configs.MYSQL.database,
            user: configs.MYSQL.user,
            password: configs.MYSQL.password,
        }
    });

    connection.raw('SELECT VERSION()', [], (err) => {
        if (err) {
            logger.error(err.message);
            process.exit();
        } else {
            logger.info(`Mysql: connected successfully "${configs.host}:${configs.port}/${configs.database || ''}"`)
        }
    });

    return connection;
})();

module.exports.user = new User(connection);

