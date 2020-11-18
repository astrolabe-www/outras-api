const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  article: {
    type: Number,
    required: true
  },
  price: {
    low: {
      type: Number,
      required: true
    },
    high: {
      type: Number,
      required: true
    },
    current: {
      type: Number,
      required: true
    }
  },
  signals: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Signal' }]
  }
});

ProductSchema.methods.calculatePrice = function() {
  const norms = [];
  this.signals.forEach((sig) => {
    const sMin = Math.min(...sig.values);
    const sMax = Math.max(...sig.values);
    const nowIndex = (60 * (new Date()).getHours()) + (new Date()).getMinutes();
    const nowValue = sig.values[nowIndex];

    if((sMax - sMin) > 0) {
      norms.push((nowValue - sMin) / (sMax - sMin));
    }
  });

  const avg_sum = norms.reduce((acc, n) => acc + n, 0);
  const avg_avg = avg_sum / Math.max(1.0, norms.length);

  this.price.current = avg_avg * (this.price.high - this.price.low) + this.price.low;
  return this;
};

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
