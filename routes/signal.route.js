const express = require('express');

const Signal = require('../models/signal.model');
const Product = require('../models/product.model');

module.exports = (app) => {
  const router = express.Router();
  app.use('/signals', router);

  router.get('/', (req, res) => {
    Signal.find().select('-_id -__v').lean().then((result) => {
      res.status(200).send({
        success: true,
        data: { signals: result }
      });
    }).catch((err) => {
      res.status(500).send({
        success: false,
        data: `${err}`
      });
    });
  });

  function currentDailyMinute() {
    const mDate = new Date();
    return Math.floor((60 * mDate.getHours()) + mDate.getMinutes());
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, parseFloat(val)));
  }

  function normalize01(val, min, max) {
    return (val - min) / (max - min);
  }

  function average(arr) {
    let sum = 0.0;
    let min = 1.0;
    let max = 0.0;

    for (const val of arr) {
      sum += val;
      if(val < min) min = val;
      if(val > max) max = val;
    }
    const rawAvg = sum / Math.max(1.0, arr.length);
    return normalize01(rawAvg, min, max);
  }

  router.post('/:signal_name/:signal_value', (req, res) => {
    Signal.findOne({ name: req.params.signal_name }).then((signal) => {
      signal.values.set(currentDailyMinute(), clamp(req.params.signal_value, 0.0, 1.0));
      signal.average = average(signal.values);

      Product.find({ _id: { $in: signal.product_ids } }).populate('signals').then((products) => {
        for (const product of products) {
          const sum = product.signals.reduce((acc, sig) => acc + sig.average, 0);
          const avg = sum / Math.max(1.0, product.signals.length);

          product.price = product.base_price + avg * product.base_price;
          product.save();
        }
      });

      signal.save().then((saved) => {
        res.status(200).send({
          success: true,
          data: { signal: saved }
        });
      });
    }).catch((err) => {
      res.status(500).send({
        success: false,
        data: `${err}`
      });
    });
  });
};
