const mongoose = require('mongoose');

const { currentDailyMinute } = require('../utils/utils');

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
    history: {
      type: [Number],
      required: true
    }
  },
  signals: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Signal' }]
  }
});

function getNormalizedSignalsAtIndex(signals, i) {
  return norms = signals.map((sig) => {
    return (sig.max === 0 && sig.min === 1) ?
      null : ((sig.max === sig.min) ?
              sig.min : (sig.values[i] - sig.min) / (sig.max - sig.min));
  }).filter(v => v !== null);
}

function calculatePriceAtIndex(prod, i) {
  const norms = getNormalizedSignalsAtIndex(prod.signals, i);
  const avg_sum = norms.reduce((acc, n) => acc + n, 0);
  const avg_avg = avg_sum / Math.max(1.0, norms.length);
  const price = avg_avg * (prod.price.high - prod.price.low) + prod.price.low;

  prod.price.history.set(i, price);
  return prod;
}

ProductSchema.methods.calculatePrice = function() {
  if (this.price.history[0] === 0) {
    this.price.history.forEach((_, i) => calculatePriceAtIndex(this, i));
  } else {
    calculatePriceAtIndex(this, currentDailyMinute());
  }
  return this;
};

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
