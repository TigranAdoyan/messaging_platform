class MessagePlugin {
   static async syncApp(ioServer, socket) {
      const userId = socket.user.id;

      const relatedUsers = await MysqlMessengerClients.User.findRelatedUsers(userId);

      const relatedUsersMessages = await Promise.all(relatedUsers.map(user => {
         return MongoClients.message.getUserMessages(userId, user.id);
      }));

      const data = [];

      relatedUsersMessages.forEach((messages = [], index) => {
         if (messages.length > 0) {
            const isOnline = !!ioServer.of(ioServer.namespaces.message).adapter.rooms.get(relatedUsers[index].id.toString());

            data.push({
               user: {
                  ...relatedUsers[index],
                  isOnline,
               },
               messages,
            })
         }
      });

      socket.emit(socketEvents.server.sync_app, data);
   }

   static async changeOnlineStatus(ioServer, socket, status) {
      const userId = socket.user.id;
      socket.join(userId.toString());

      const relatedUsers = await MysqlMessengerClients.User.findRelatedUsers(userId);

      relatedUsers.forEach(user => {
         if (ioServer.of(ioServer.namespaces.message).adapter.rooms.get(user.id.toString())) {
            socket.to(user.id.toString()).emit(socketEvents.server['online_status_change'], {
               userId: socket.user.id,
               status
            });
         }
      })

      // const groups = await MongoClients.group.getByUser(userId);
      //
      // groups.forEach(group => {
      //    socket.join(group._id)
      // });
   }

   static async changeTypingStatus(ioServer, socket, data) {
      const senderId = socket.user.id;
      const receiverId = data.receiverId;

      if (ioServer.of(ioServer.namespaces.message).adapter.rooms.get(receiverId.toString())) {
         socket.to(receiverId.toString()).emit(socketEvents.server['typing_status_change'], {
            senderId,
            status: data.status
         });
      }
   }

   static async sendMessage(ioServer, socket, data, cb) {
      const senderId = socket.user.id;

      let receiverId = null;

      while (!receiverId) {
         const id = Math.ceil(Math.random()*5);

         if (id !== senderId) {
            receiverId = id;
         }
      }

      socket.to(receiverId.toString()).emit(socketEvents.server['send_message'], {
         messageId: data.messageId
      });

      // const message = await MongoClients.message.create({
      //    senderId: socket.user.id,
      //    receiverId: data.receiverId,
      //    receiverType: data.receiverType,
      //    content: {
      //       text: data.msg,
      //    }
      // });
      //
      // if (cb) {
      //    cb({
      //       tempId: data.tempId,
      //       receiverId: data.receiverId,
      //       message
      //    })
      // }

      // if (message.receiverType === 'user') {
      //    console.log(`UserId ${socket.user.id} sended msg to ${message.receiverId}`);
      //    socket.to(message.receiverId.toString()).emit(socketEvents.server.send_message, message);
      // }
   }

   static async seenMessage(ioServer, socket, data) {
      await MongoClients.message.updateMany({
         senderId: data.senderId,
         messagesIds: data.messagesIds
      }, {seen: true});

      const emitData = {
         receiverId: socket.user.id,
         messagesIds: data.messagesIds
      };

      socket.to(data.senderId.toString()).emit(socketEvents.server["seen_message"], emitData);
   }
}

module.exports = MessagePlugin;