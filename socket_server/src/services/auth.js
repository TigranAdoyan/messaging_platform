const jwt = require('jsonwebtoken');
const redisClients = require('../cores/Redis');

module.exports = new (function () {

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

      const authData = await redisClients.auth.get(decode.userId.toString());

      if (!authData) {
         throw new HttpError('invalid token', httpCode.AUTH_ERROR);
      }

      return JSON.parse(authData);
   }

})();