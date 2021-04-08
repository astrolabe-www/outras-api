const express = require('express');

const Product = require('../models/product.model');
const { currentDailyMinute } = require('../utils/utils');
const { createTransport } = require('nodemailer');

function sendEmail(req, res) {
  const smtpTransport = createTransport({
    host: 'mail.smtp2go.com',
    port: process.env.E_PRT,
    auth: {
      user: process.env.E_USR,
      pass: process.env.E_PSW
    }
  });

  const mailOptions = {
    from: process.env.E_SND,
    to: process.env.E_REC,
    replyTo: `${req.body.email}`,
    subject: '[OUTRAS.ML] ORDER',
    text: `${JSON.stringify(req.body, null, 4)}`
  };

  smtpTransport.sendMail(mailOptions, (error, response) => {
    if(error) {
      res.status(500).send({
        success: false,
        data: `${error}`
      });
    } else {
      res.status(200).send({ success: true });
    }
  });
}

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

  router.post('/:token', sendEmail);
};
