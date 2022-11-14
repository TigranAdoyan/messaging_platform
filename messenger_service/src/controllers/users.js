const controllerValidator = require('../helpers/controllerValidator');
const CoreController = require('./core');
const authAuthService = require('../services/auth');

class UsersController extends CoreController {
   constructor() {
      super('users');
   }

   async login(req, res) {
      const { username, password } = req.body;

      const authData = await authAuthService.login({
         username,
         password
      });

      res.json(authData);
   }

   async authInfo(req, res) {
      const userData = req.user;

      res.json(userData);
   }
}

module.exports = controllerValidator(new UsersController());