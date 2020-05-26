const express = require('express');

const Signal = require('../models/signal.model');

module.exports = (app) => {
  const router = express.Router();
  app.use('/signals', router);

  router.get('/', (req, res) => {
    Signal.find().then((result) => {
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
