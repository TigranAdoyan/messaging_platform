const {user: userMysql} = require('./mysql');
const messageMongo = require('./mongo/message');

module.exports = function(client) {
    this.sync_data = async function(data) {
        const userId = data.userId;

        const user = await userMysql.findOne({
            where: {
                id: parseInt(userId)
            }
        });

        user.messages = await messageMongo.getMessages(user.id);

        await client.pub(`messenger.response.sync_data.${userId}`, user);
    };

    this.send_message = async function(data) {
        const { senderId } = data;

        let receiverId = null;

        while (!receiverId) {
            const id = Math.ceil(Math.random()*5);

            if (id !== senderId) {
                receiverId = id;
            }
        }

        const message = {
            senderId,
            receiverId
        };

        await client.pub(`messenger.response.send_message.${message.receiverId}`, message);
    }
};