module.exports = function (connection) {
    this.findOne = async (props) => {
        const {
            where = {},
            select = ['*'],
        } = props;
        console.log('where', where);
        return connection
            .select(...select)
            .from('users')
            .where(where)
            .first();
    };

    this.findFriends = async (props) => {
        const { userId } = props;

        return connection
            .select(
                'users.id',
                'users.username',
                'users.email',
                'users.profile_img_url'
            )
            .from('user_subscribers')
            .leftJoin('users', function () {
                    this.on('user_subscribers.userId', '=', 'users.id')
                    .orOn('user_subscribers.subscriberId', '=', 'users.id')
            })
            .where(function () {
               this.where({
                   'user_subscribers.userId': userId
               }).orWhere({
                   'user_subscribers.subscriberId': userId
               })
            })
            .andWhere('users.id', '<>', userId)
            .then(response => {
                const list = [];

                response.forEach((user) => {
                    if (!list.find(({id}) => id === user.id)) {
                        list.push(user);
                    }
                });

                return list;
            });
    };
};