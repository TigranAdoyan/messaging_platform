const mongoose = require('mongoose');
const connection = require('./connection');

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

model.getMessages = async function (userId) {
    return model.find({
        $or: [
            {senderId: userId},
            {receiverId: userId},
        ],
        receiverType: 'user',
    })
        .sort({'sendAt': 1})
        .lean();
};

module.exports = model;