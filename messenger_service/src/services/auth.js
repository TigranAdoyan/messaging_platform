const jwt = require('jsonwebtoken');
const models = require('../mysql');
const { httpCode, HttpError} = require("../cores/HttpError");
const redisClient = require("../cores/Redis");

module.exports = new (function () {
    this.login = async (props) => {
        const { username, password } = props;

        const user = await models.user.findOne({
            where: {
                username,
            },
            join: ['users']
        });

        if (!user || user.password !== password) {
            throw new HttpError('username/password is wrong !')
        }

        const tokenPromise = new Promise((resolve, reject) => {
            jwt.sign({ userId: user.id }, configs.JWT_SECRET, (err, token) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(token);
                }
            })
        });

        const friendsPromise = models.user.findFriends({
            userId: user.id
        });

        const [ token, friends ] = await Promise.all([tokenPromise, friendsPromise]);

        const authData = {
            id: user.id,
            username: user.username,
            email: user.email,
            friends,
            token
        };

        await redisClient.set(authData.id, authData);

        return authData;
    };

    this.auth = async (props) => {
        const { token } = props;

        if (!token) {
            throw new HttpError('invalid token', httpCode.AUTH_ERROR);
        }

        const decode = await new Promise((resolve, reject) => {
            jwt.verify(token, configs.JWT_SECRET, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })
        });

        const authData = await this._authStorage.client.get(decode.userId.toString());

        if (!authData) {
            throw new HttpError('invalid token', httpCode.AUTH_ERROR);
        }

        return JSON.parse(authData);
    }

})();
