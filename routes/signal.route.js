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
        data: result
      });
    }).catch((err) => {
      res.status(500).send({
        success: false,
        data: `${err}`
      });
    });
  });

  router.post('/:signal_name/:signal_value', (req, res) => {
    Signal.findOne({ name: req.params.signal_name }).then((signal) => {
      // TODO: set value in signal array
      // signal.value[magick_foo_time] = req.params.signal_value;

      Product.find({ _id: { $in: signal.product_ids } }).then((products) => {
        // TODO: update prices;
        console.log(products);
      });

      signal.save().then((saved) => {
        res.status(200).send({
          success: true,
          data: saved
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
