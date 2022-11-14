const uuid = require('uuid');
const authService = require('../services/auth');

class Middleware {
    constructor() {
    }

    async auth(socket, next) {
        try {
            const token = socket.handshake.auth.token;

            if (typeof token !== 'string') {
                console.log('socketIo: invalid token');
                throw new HttpError('invalid token');
            }

            socket.user = await authService.auth({
                token
            });

            next();
        } catch (err) {
            console.log(err.message);

            next(err)
        }
    }

    async session(socket, next) {
        const sessionID = socket.handshake.auth.sessionID;

        if (sessionID) {
            logger.info(`SocketIO: getted already created session`);

            // find existing session
            const session = await RedisClients.messengerSession.get(sessionID);
            if (session) {
                socket.sessionID = sessionID;
                socket.userID = session.userID;
                socket.username = session.username;

                return next();
            }
        }

        const username = socket.handshake.auth.username;

        if (!username) {
            return next(new Error('invalid username'));
        }

        socket.sessionID = uuid.v4();
        socket.userID = uuid.v4();
        socket.username = username;

        logger.info(`SocketIO: created new session ${socket.sessionID} for userId:${socket.userID} `);
        next();
    }
}

module.exports = new Middleware();
