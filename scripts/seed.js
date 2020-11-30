require('dotenv').config();

const mongoose = require('mongoose');

const { logger } = require('../utils/utils');

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
  const SIGNAL2PRODUCT = {};

  function createProduct(mProduct) {
    const sig_refs = [];

    for (const sig_name of mProduct.signal_names) {
      if (!(sig_name in SIGNALS)) {
        const new_signal = new Signal({
          name: sig_name,
          values: fillArray(0, 24 * 60),
          average: 0.0,
          max: 0.0,
          min: 1.0
        });
        SIGNALS[sig_name] = new_signal;
        new_signal.save();
      }
      sig_refs.push(SIGNALS[sig_name]);

      if (!(sig_name in SIGNAL2PRODUCT)) {
        SIGNAL2PRODUCT[sig_name] = {};
      }
    }

    mProduct.signals = sig_refs;
    mProduct.price = {
      low: mProduct.base_price,
      high: 5.0 * mProduct.base_price,
      raw: fillArray(0, 24 * 60),
      history: fillArray(0, 24 * 60)
    };
    const product = new Product(mProduct);

    for (const sig_name of mProduct.signal_names) {
      SIGNAL2PRODUCT[sig_name][product._id] = true;
    }

    return product.calculatePrice().save();
  }

  function populateSignalsWithProducts() {
    const to_save = [];
    for (const [sig_name, signal] of Object.entries(SIGNALS)) {
      signal.product_ids = Object.keys(SIGNAL2PRODUCT[sig_name]);
      to_save.push(signal.save());
    }
    return Promise.all(to_save);
  }

  mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => Product.deleteMany({ }))
    //.then(() => Signal.deleteMany({ }))
    .then(() => Signal.find())
    .then((found_signals) => {

      for (const sig of found_signals) {
        SIGNALS[sig.name] = sig;
      }

      /*  ALGOTYPES  */

      PRODUCTS.push(
        createProduct({
          name: 'splay',
          article: 476011,
          base_price: 450,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_11' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'noise',
          article: 476010,
          base_price: 450,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_10' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'sha3-512',
          article: 476009,
          base_price: 450,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_09' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'integrate',
          article: 476008,
          base_price: 450,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_08' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'breath/depth',
          article: 476007,
          base_price: 450,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_07' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'gcd',
          article: 476006,
          base_price: 450,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_06' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'convex hull',
          article: 476005,
          base_price: 450,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_05' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'quicksort',
          article: 476004,
          base_price: 450,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_04' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'reaction/diffusion',
          article: 476003,
          base_price: 450,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_03' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'eigenvalue',
          article: 476002,
          base_price: 450,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_02' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'fft',
          article: 476001,
          base_price: 450,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_01' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'prng',
          article: 476000,
          base_price: 450,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_12' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'inversion',
          article: 476012,
          base_price: 450,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_12' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'pruning',
          article: 476013,
          base_price: 450,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_01' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'exchange',
          article: 476014,
          base_price: 450,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_01' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'compression',
          article: 476015,
          base_price: 550,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_02' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'proof',
          article: 476016,
          base_price: 650,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_03' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'cordic',
          article: 476017,
          base_price: 650,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_04' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'encoding',
          article: 476018,
          base_price: 650,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_05' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'primality',
          article: 476019,
          base_price: 550,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_06' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'curves',
          article: 476020,
          base_price: 550,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_07' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'annealing',
          article: 476021,
          base_price: 650,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_08' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'visualizer',
          article: 476064,
          base_price: 800,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'WIFI_09' ]
        })
      );

      /*  RELATIVE INTENSITY  */

      PRODUCTS.push(
        createProduct({
          name: 'ulna',
          article: 166932,
          base_price: 300,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'HACKRF_2000' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'pollex',
          article: 166930,
          base_price: 300,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'HACKRF_790' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'indica',
          article: 166931,
          base_price: 300,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'HACKRF_2025' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'annula',
          article: 166933,
          base_price: 300,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'HACKRF_2000' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: '3d4d',
          article: 166935,
          base_price: 300,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'HACKRF_715' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: '2d3d',
          article: 166934,
          base_price: 300,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'HACKRF_2025' ]
        })
      );

      /*  VISUALIZING WORLDS  */

      PRODUCTS.push(
        createProduct({
          name: 'radix',
          article: 363703,
          base_price: 300,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'HACKRF_1540' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'proxis',
          article: 363701,
          base_price: 300,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'HACKRF_1400' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'helix',
          article: 363700,
          base_price: 300,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'HACKRF_1515' ]
        })
      );

      PRODUCTS.push(
        createProduct({
          name: 'arynx',
          article: 363702,
          base_price: 300,
          signal_names: [ 'TEMPERATURE_ARMPIT', 'TEMPERATURE_MOUTH', 'HEART_BEAT', 'HACKRF_2430' ]
        })
      );
    })
    .then(() => Promise.all(PRODUCTS))
    .then(() => populateSignalsWithProducts())
    .then(() => {
      log('done seeding');
      mongoose.disconnect();
    }).catch((err) => {
      logger.error('ERROR while seeding: ' + err);
    });
}

if (require.main === module) {
  seed();
}
