const fs = require('fs');
const winston = require('winston');

const {
    getAbsoluteFilePath,
    isFileExist,
} = require('../helpers/fs');

class Logger {
    constructor() {
        winston.addColors({
            info: 'green',
            error: 'red',
            warn: 'yellow',
        });

        this.infoLogger = Logger.createLogger('info', 'info');
        this.errorLogger = Logger.createLogger('error', 'error');
        this.logger = Logger.createLogger('log');
    }

    info(msg) {
        this.infoLogger.info(Logger.toLogFormat(msg, 'info'));
    }

    error(msg) {
        this.errorLogger.error(Logger.toLogFormat(msg, 'error'));
    }

    log(message, level = 'info') {
        this.logger.log({
            message,
            level,
        });
    }

    static createLogger(level, filename) {
        const logger = winston.createLogger();

        logger.add(new winston.transports.Console({ format: winston.format.cli() }));

        if (filename && process.env.NODE_ENV !== 'development') {
            const filePath = getAbsoluteFilePath(`logs/${filename}.log`);

            if (!isFileExist(filePath)) {
                fs.writeFileSync(filePath, '');
            }

            logger.add(new winston.transports.File({
                filename: filePath,
                level,
                format: winston.format.simple(),
            }));
        }

        return logger;
    }

    static toLogFormat(msg, type) {
        let log = '';

        const date = new Date().toISOString()
            .replace(/T/, ' ') // replace T with a space
            .replace(/\..+/, ''); // delete the dot and everything after

        log = `${date} => ${msg}`;

        return log;
    }
}

module.exports = new Logger();
