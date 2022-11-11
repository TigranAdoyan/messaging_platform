const controllerValidator = require('../helpers/controllerValidator');
const CoreController = require('./core');
const auth = require('../../../services/auth');

class UsersController extends CoreController {
   service = {
      auth
   };

   constructor() {
      super('users');
   }

   async login(req, res) {
      const { username, password } = req.body;

      const authData = await this.service.auth.login({
         username,
         password
      });

      res.json(authData);
   }

   async getAuthData(req, res) {
      const userData = req.user;

      res.json(userData);
   }
}

module.exports = controllerValidator(new UsersController());