const mongoose = require('mongoose');
require('./signal.model');

const ProductSchema = new mongoose.Schema({
  article: {
    type: Number,
    required: true
  },
  base_price: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  signals: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Signal' }]
  }
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
