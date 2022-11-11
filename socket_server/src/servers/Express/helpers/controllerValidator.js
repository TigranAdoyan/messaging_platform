const {httpCode} = require("../../../cores/HttpError");

function controllerValidator(obj) {
    return new Proxy(obj, {
       get(target, propKey) {
          if (typeof target[propKey] === 'function') {
             return new Proxy(target[propKey], {
                async apply(method, handler, args) {
                   try {
                      if (obj.validator && obj.validator[method.name]) {
                         Object.keys(obj.validator[method.name]).forEach(key => {
                            // args[0] => req; key => ['body', 'query', 'params'];
                            const validationResult = obj.validator[method.name][key].validate(args[0][key]);
                            if (validationResult.error) {
                               throw new HttpError(validationResult.error.message, httpCode.BAD_REQUEST);
                            }
                         })
                      }
                      return method.apply(obj, args)
                          .catch(err => args[args.length - 1](err));
                   } catch (err) {
                      args[args.length - 1](err);
                   }
                }
             })
          }
          return target[propKey];
       }
    })
}

module.exports = controllerValidator;