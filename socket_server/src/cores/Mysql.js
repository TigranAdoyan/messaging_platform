const mysql = require('mysql2');

class MysqlClient {
   constructor(configs) {
      this.connection = mysql.createConnection({
         host: configs.host,
         port: configs.port,
         database: configs.database,
         user: configs.user,
         password: configs.password,
      });

      this.connection.query('SELECT VERSION()', [], (err, result) => {
         if (err) {
            logger.error(err.message);
         } else {
            logger.info(`Mysql: connected successfully "${configs.host}:${configs.port}/${configs.database || ''}"`)
         }
      })
   }
}

module.exports.durak = new MysqlClient(configs.MYSQL.DURAK);
