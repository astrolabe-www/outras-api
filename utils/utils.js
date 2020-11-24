const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.combine(winston.format.json(), winston.format.errors({stack: true})),
  transports: [ new winston.transports.Console() ]
});

currentDailyMinute = function() {
  const mDate = new Date();
  return Math.floor((60 * mDate.getUTCHours()) + mDate.getUTCMinutes());
}

module.exports = {
  logger,
  currentDailyMinute
};
