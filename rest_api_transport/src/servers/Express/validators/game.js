const Joi = require('joi');

module.exports = {
    create: {
        body: Joi.object({
            accessType: Joi.string().valid('public', 'private').required(),
            playersCount: Joi.number().min(1).max(4).required(),
            gameType: Joi.string().valid('friendly', 'single').required(),
            players: Joi.array().items(Joi.string()).required().min(2).max(4)
        })
    }
};
