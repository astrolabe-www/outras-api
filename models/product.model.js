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

ProductSchema.methods.calculatePrice = function() {
  const total_sum = this.signals.reduce((acc, sig) => acc + sig.average, 0);
  const total_avg = total_sum / Math.max(1.0, this.signals.length);

  const running_sum = this.signals.reduce((acc, sig) => {
    const tAvg = (sig.average > 0.0) ? (sig.last_hour.average / sig.average) : 0.0;
    return acc + Math.min(2.0, tAvg);
  }, 0);
  const running_avg = running_sum / Math.max(1.0, this.signals.length);

  this.price = this.base_price * (1.0 + total_avg + running_avg);
  return this;
};

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
