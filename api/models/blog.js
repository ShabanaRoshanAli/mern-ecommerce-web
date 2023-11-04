const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    image: {
    type: String,
    default: ''
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
    }
})

blogSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

blogSchema.set('toJSON', {
    virtuals: true,
});
exports.Blog = mongoose.model('Blog', blogSchema)