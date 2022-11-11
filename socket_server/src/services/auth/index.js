const jwt = require('jsonwebtoken');
const RedisClients = require("../../cores/Redis");
const { User } = require('../../mysql/messenger');
const { httpCode } = require("../../cores/HttpError");

class AuthService {
    _authStorage = RedisClients.auth;

    _User = User;

    constructor() {
    }

    async login(props) {
        const { username, password } = props;

        const user = await this._User.findBy('username', username);

        if (!user) {
            throw new HttpError('username/password is wrong')
        }

        const isPasswordRight = user.password === password;

        if (!isPasswordRight) {
            throw new HttpError('username/password is wrong')
        }

        const token = await new Promise((resolve, reject) => {
            jwt.sign({ userId: user.id }, configs.JWT_SECRET, (err, token) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(token);
                }
            })
        });

        const authData = {
            id: user.id,
            username: user.username,
            email: user.email,
            password: user.password,
            token
        };

        await this._authStorage.client.set(authData.id.toString(), JSON.stringify(authData));

        return authData;
    }

    async auth(props) {
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
}

module.exports = new AuthService();
