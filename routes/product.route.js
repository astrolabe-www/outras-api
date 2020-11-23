const express = require('express');

const Product = require('../models/product.model');

module.exports = (app) => {
  const router = express.Router();
  app.use('/products', router);

  router.get('/', (req, res) => {
    Product.find().select('-_id -__v').lean().then((result) => {
      res.status(200).send({
        success: true,
        data: { products: result }
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

  router.get('/prices', (req, res) => {
    Product.find().select('-_id -__v').lean().then((result) => {
      const prices = {};
      for (const product of result) {
        prices[product.article] = product.price.history[currentDailyMinute()];
      }

      res.status(200).send({
        success: true,
        data: { prices }
      });
    }).catch((err) => {
      res.status(500).send({
        success: false,
        data: `${err}`
      });
    });
  });

  router.get('/:article/price', (req, res) => {
    Product.findOne({ article: req.params.article }).select('-_id -__v').lean().then((result) => {
      res.status(200).send({
        success: true,
        data: { price: result.price.history[currentDailyMinute()] }
      });
    }).catch((err) => {
      res.status(500).send({
        success: false,
        data: `${err}`
      });
    });
  });

  router.get('/:article', (req, res) => {
    Product.findOne({ article: req.params.article }).select('-_id -__v -signals').lean().then((result) => {
      res.status(200).send({
        success: true,
        data: { product: result }
      });
    }).catch((err) => {
      res.status(500).send({
        success: false,
        data: `${err}`
      });
    });
  });
};
