const express = require('express');

const Product = require('../models/product.model');

module.exports = (app) => {
  const router = express.Router();
  app.use('/products', router);

  router.get('/', (req, res) => {
    Product.find().then((result) => {
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
};
