const authService = require("../../../services/auth");

async function auth(req, res, next) {
    try {
        const token = req.headers['authorization'];

        req.user = await authService.auth({
            token
        });

        next();
    } catch (err) {
        next(err)
    }
}

module.exports = auth;
