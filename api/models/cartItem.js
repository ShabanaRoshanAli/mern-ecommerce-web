const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartItemSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  }
});

cartItemSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

cartItemSchema.set('toJSON', {
  virtuals: true,
});

exports.CartItem = mongoose.model('CartItem', cartItemSchema);
