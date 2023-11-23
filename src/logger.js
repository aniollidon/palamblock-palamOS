var EventLogger = require('node-windows').EventLogger;

class Logger {
  constructor() {
    this.log = new EventLogger('PalamOS');
  }

  info(message) {
    this.log.info(message);
    console.log(message);
  }

  warn(message) {
    this.log.warn(message);
    console.warn(message);
  }

  error(message) {
    this.log.error(message);
    console.error(message);
  }

}

const logger = new Logger();
module.exports = logger;
