const CoreMysql = require('./core');

class User extends CoreMysql {
    constructor() {
        super();
    }

    async findBy(column, value) {
        if (!['username', 'id'].includes(column)) {
            return {};
        }

        return this.query(`
           SELECT
              id,
              username,
              age,
              email,
              password,
              profile_img_url
          FROM users WHERE ${column} = ?
      `, [value]).then(result => result[0]);
    };

    async findRelatedUsers(userId) {
        return this.query(`
           SELECT
              u.id,
              u.username,
              u.age,
              u.email,
              u.profile_img_url
           FROM user_subscribers AS us
              LEFT JOIN users AS u ON u.id IN (us.userId, us.subscriberId)
           WHERE u.id != ? AND us.userId = ? OR u.id != ? AND us.subscriberId = ? 
      `, [parseInt(userId), parseInt(userId), parseInt(userId), parseInt(userId)])
            .then((result = []) => result.unique());
    }

    async findSubscribers(userId) {
        return this.query(`
           SELECT
              sub.id,
              sub.username,
              sub.age,
              sub.email,
              sub.profile_img_url
           FROM users u
             LEFT JOIN user_subscribers AS us ON u.id = us.userId
             LEFT JOIN users as sub ON sub.id = us.subscriberId 
           WHERE us.userId = ?
      `, [parseInt(userId)]);
    };

    async findSubscriptions(userId) {
        return this.query(`
            SELECT
              u.id,
              u.username,
              u.age,
              u.email,
              u.profile_img_url
           FROM users AS u
             LEFT JOIN user_subscribers AS us ON u.id = us.userId
           WHERE us.subscriberId = ?
      `,  [parseInt(userId)]);
    };

    async findRecommendedUsers(userId) {
        return this.query(`
            SELECT
              u.id,
              u.username,
              u.age,
              u.email,
              u.profile_img_url
            FROM users AS u
             LEFT JOIN user_subscribers AS us ON u.id = us.userId OR u.id = us.subscriberId
            WHERE us.userId <> ? AND us.subscriberId <> ?
      `,  [parseInt(userId), parseInt(userId)]);
    }
}

module.exports = new User();
