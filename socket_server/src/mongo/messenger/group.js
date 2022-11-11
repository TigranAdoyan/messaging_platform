const mongoose = require('mongoose');
const connection = require('./connection');

const {
    String,
    Number,
    Date
} = mongoose.Schema.Types;

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    iconUrl: {
        type: String
    },
    maxMembersCount: {
        type: Number,
        required: true,
    },
    membersCount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['public', 'private'],
    },
    createdAt: {
        type: Date,
        default: null
    },
    deletedAt: {
        type: Date,
        default: null
    },
});

const model = connection.model('groups', schema);

model.getByUser = async function(userId) {
    return model.aggregate([
        {
            $lookup: {
                from: "user_group",
                localField: "_id",
                foreignField: "groupId",
                as: "group_user"
            }
        },
        {
            $match: {
                'group_user.userId': userId.toString(),
            }
        }
    ]);
};

module.exports = model;
