require('dotenv').config();

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
    if (max === min) return min;
    else return (val - min) / (max - min);
  }

  function average(arr, avg_length = 60) {
    const thisMinuteIndex = currentDailyMinute() + arr.length;
    const hourAgoIndex = thisMinuteIndex - avg_length;

    let sum = 0.0;
    let min = 1.0;
    let max = 0.0;

    for(let i = thisMinuteIndex; i > hourAgoIndex; i--) {
      const val = arr[i % arr.length];

      sum += val;
      if(val < min) min = val;
      if(val > max) max = val;
    }
    const rawAvg = sum / Math.max(1.0, avg_length);
    return normalize01(rawAvg, min, max);
  }

  router.post(`${process.env.POST_TOKEN}/:signal_name/:signal_value`, (req, res) => {
    Signal.findOne({ name: req.params.signal_name }).then((signal) => {
      signal.values.set(currentDailyMinute(), clamp(req.params.signal_value, 0.0, 1.0));
      signal.average_last_hour = average(signal.values, 60);
      signal.average_total = average(signal.values, signal.values.length);

      Product.find({ _id: { $in: signal.product_ids } }).populate('signals').then((products) => {
        for (const product of products) {
          const total_sum = product.signals.reduce((acc, sig) => acc + sig.average_total, 0);
          const total_avg = total_sum / Math.max(1.0, product.signals.length);

          const running_sum = product.signals.reduce((acc, sig) => {
            const tAvg = (sig.average_total > 0.0) ? (sig.average_last_hour / sig.average_total) : 0.0;
            return acc + Math.min(2.0, tAvg);
          }, 0);
          const running_avg = running_sum / Math.max(1.0, product.signals.length);

          product.price = product.base_price * (1.0 + total_avg + running_avg);
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
