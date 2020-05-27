const mongoose = require('mongoose');

const SignalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  values: {
    type: [Number],
    required: true
  },
  average: {
    type: Number,
    required: true
  },
  product_ids: {
    type: [mongoose.Schema.Types.ObjectId]
  }
});

const Signal = mongoose.model('Signal', SignalSchema);

module.exports = Signal;
