const validationStore = require('../validators');

class CoreController {
   constructor(controller) {
       if (validationStore[controller]) {
          this.validator = validationStore[controller];
       }
   }
}

module.exports = CoreController;