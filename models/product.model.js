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
    raw: {
      type: [Number],
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

function priceAtIndex(prod, i) {
  const norms = getNormalizedSignalsAtIndex(prod.signals, i);
  const norm_sum = norms.reduce((acc, n) => acc + n, 0);
  const norm_avg = norm_sum / Math.max(1.0, norms.length);
  const price = norm_avg * (prod.price.high - prod.price.low) + prod.price.low;
  return price;
}

const AVG_SIZE = 32;

function averageSignal(signal) {
  const averages = new Array(signal.length);
  const avgVals = new Array(AVG_SIZE);
  let avgSum = 0;
  let currAvgIndex = 0;

  for(let i = 0; i < avgVals.length; i++) {
    avgVals[i] = signal[signal.length - avgVals.length + i];
    avgSum += avgVals[i];
  }

  for(let i = 0; i < averages.length; i++) {
    avgSum -= avgVals[currAvgIndex];
    avgVals[currAvgIndex] = signal[i];
    avgSum += avgVals[currAvgIndex];
    currAvgIndex = (currAvgIndex + 1) % avgVals.length;
    averages[i] = avgSum / avgVals.length;
  }
  return averages;
}

function averagePriceAtIndex(signal, i) {
  const firstIndex = i + signal.length - AVG_SIZE;
  const lastIndex = i + signal.length;

  let avgSum = 0;
  for(let ii = firstIndex; ii < lastIndex; ii++) {
    avgSum += signal[ii % signal.length];
  }
  return avgSum / AVG_SIZE;
}

ProductSchema.methods.calculatePrice = function() {
  if (this.price.raw[0] === 0) {
    this.price.raw = this.price.raw.map((_, i) => priceAtIndex(this, i));
    this.price.history = averageSignal(this.price.raw);
  } else {
    const nowIndex = currentDailyMinute();
    this.price.raw.set(nowIndex, priceAtIndex(this, nowIndex));
    this.price.history.set(nowIndex, averagePriceAtIndex(this.price.raw, nowIndex));
  }

  return this;
};

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
