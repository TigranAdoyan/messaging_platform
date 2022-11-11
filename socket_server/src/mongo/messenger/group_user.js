const mongoose = require('mongoose');
const connection = require('./connection');

const {
    String,
    Boolean,
    Date
} = mongoose.Schema.Types;

const schema = new mongoose.Schema({
    groupId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'member']
    },
    accepted: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    addedAt: {
        type: Date,
        default: Date.now
    },
    deletedAt: {
        type: Date,
        default: null
    },
});

module.exports = connection.model('group_user', schema);
