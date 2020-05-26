require('dotenv').config();

const mongoose = require('mongoose');

const logger = require('../utils/logger');

const Product = require('../models/product.model');
const Signal = require('../models/signal.model');

function log(msg) {
  if (require.main === module) {
    logger.info(msg);
  }
}

function fillArray(value, len) {
  const arr = [];
  for (let i = 0; i < len; i++) arr.push(value);
  return arr;
}

function seed(dbURI) {
  dbURI = dbURI || process.env.MONGODB_URI;

  const PRODUCTS = [];
  const SIGNALS = {};

  function createProduct(mProduct) {
    const sig_refs = [];

    for (const sig_name of mProduct.signals) {
      if (!(sig_name in SIGNALS)) {
        const new_signal = new Signal({
          name: sig_name,
          values: fillArray(0, 24 * 60)
        });
        SIGNALS[sig_name] = new_signal;
        new_signal.save();
      }
      sig_refs.push(SIGNALS[sig_name]);
    }

    mProduct.signals = sig_refs;
    const product = new Product(mProduct);
    return product.save();
  }

  mongoose.connect(dbURI, { useNewUrlParser: true })
    .then(() => Product.deleteMany({ }))
    .then(() => Signal.find())
    .then((found_signals) => {

      for (const sig of found_signals) {
        SIGNALS[sig.name] = sig;
      }

      PRODUCTS.push(
        createProduct({
          article: 121212,
          base_price: 100,
          price: 200,
          signals: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_ANUSH', 'HEART_BEAT', 'WIFI_01' ]
        })
      );
    })
    .then(() => {
      Promise.all(PRODUCTS).then(() => {
        log('done seeding');
        mongoose.disconnect();
      });
    }).catch((err) => {
      logger.error('ERROR while seeding: ' + err);
    });
}

if (require.main === module) {
  seed();
}
