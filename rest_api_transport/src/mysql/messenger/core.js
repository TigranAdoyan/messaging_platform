const MysqlClients = require('../../cores/Mysql');

class CoreMysql {
    client = MysqlClients.durak;

    constructor() {}

    query(sql, binds) {
        return new Promise((resolve, reject) => {
            this.client.connection.query(sql, binds, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }
}

module.exports = CoreMysql;
