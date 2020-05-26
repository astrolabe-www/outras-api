require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const logger = require('./utils/logger');

const product = require('./routes/product.route');
const signal = require('./routes/signal.route');

const PORT = process.env.PORT || 5050;
const app = express();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true }).then(() => {
  logger.info('Connected to database...');
});

const corsOptions = {
  origin: [ process.env.CORS_ORIGIN_GH, process.env.CORS_ORIGIN_GL ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(helmet());

app.get('/', (req, res) => {
  res.status(200).send({
    success: true,
    data: { message: 'API OK' }
  });
});

product(app);
signal(app);

let server = app.listen(PORT, () => {
  logger.info(`Listening @ ${PORT}`);
});

module.exports = server;
