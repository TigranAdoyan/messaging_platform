const models = require('../mysql');

module.exports = async function UsersHandler(client) {
   await client.sub({
       client,
       topic: 'messenger.sync_data.request',
       callback: async ({ data }) => {
           const userId = data.userId;

           const user = await models.user.findOne({
               where: {
                  id: parseInt(userId)
               }
           });

           await client.pub(`messenger.sync_data.response.${userId}`, JSON.stringify(user));
       }
   })
};