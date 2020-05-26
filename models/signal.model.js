const mongoose = require('mongoose');

const SignalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  values: {
    type: [Number],
    required: true
  }
});

const Signal = mongoose.model('Signal', SignalSchema);

module.exports = Signal;
