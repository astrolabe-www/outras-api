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

  function average(arr, avg_length) {
    avg_length = avg_length || arr.length;

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

    const average = sum / avg_length;

    return {
      average,
      min,
      max
    };
  }

  router.post(`${process.env.POST_TOKEN}/:signal_name/:signal_value`, (req, res) => {
    Signal.findOne({ name: req.params.signal_name }).then((signal) => {
      const cValue = clamp(req.params.signal_value, 0.0, 1.0);
      signal.values.set(currentDailyMinute(), cValue);

      const allAverage = average(signal.values);
      signal.average = allAverage.average;
      signal.min = allAverage.min;
      signal.max = allAverage.max;

      const hourAverage = average(signal.values, 60);
      signal.last_hour.average = hourAverage.average;
      signal.last_hour.min = hourAverage.min;
      signal.last_hour.max = hourAverage.max;

      Product.find({ _id: { $in: signal.product_ids } }).populate('signals').then((products) => {
        for (const product of products) {
          product.calculatePrice().save();
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
