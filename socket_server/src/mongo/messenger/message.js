const mongoose = require('mongoose');
const connection = require('./connection');
const groupMongoClient = require('./group');

const {
    String,
    Boolean
} = mongoose.Schema.Types;

const schema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true
    },
    receiverId: {
        type: String,
        required: true
    },
    receiverType: {
        type: String,
        enum: ['group', 'user'],
        required: true,
    },
    seen: {
        type: Boolean,
        default: false
    },
    content: {
        type: {
            text: {
                type: String,
                required: true,
            },
            files: {
                type: [{type: String}],
                required: true,
                default: []
            }
        }
    },
    sentAt: {
        type: Date,
        default: () => Date.now(),
    },
    deletedAt: {
        type: Date,
        default: null
    },
});

const model = connection.model('messages', schema);

model.getUserMessages = async function (firstUserId, secondUserId) {
    firstUserId = firstUserId.toString();
    secondUserId = secondUserId.toString();

    return model.find({
        $or: [
            {senderId: firstUserId, receiverId: secondUserId},
            {senderId: secondUserId, receiverId: firstUserId},
        ],
        receiverType: 'user',
    })
        .sort({'sendAt': 1})
        .lean();
};

model.getByUser = async function (userId) {
    const groups = await groupMongoClient.getByUser(userId)

    return model.aggregate([
        {
            $match: {
                $or: [
                    {
                        $or: [{senderId: userId.toString()}, {receiverId: userId.toString()}],
                        receiverType: 'user'
                    },
                    {receiverId: groups.map((_id) => _id), receiverType: 'group'},
                ],
            }
        },
        {
            $group: {
                _id: {receiverId: "$receiverId", senderId: "$senderId", receiverType: "$receiverType"},
                records: {$push: "$$ROOT"}
            }
        },
        {$sort: {sentAt: -1}},
    ]).then(data => data.map(({records}) => records));
};

module.exports = model;
