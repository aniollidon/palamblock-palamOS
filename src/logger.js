const fs = require('fs');
class Logger {
  constructor() {
    this.file = "palamOS.log"
  }

  info(message) {
    console.log(message);
    //if message is object
    if (typeof message === 'object') {
      message = JSON.stringify(message);
    }
    fs.appendFileSync(this.file, "INFO:" + message + "\n");
  }

  warn(message) {
    console.warn(message);
    //if message is object
    if (typeof message === 'object') {
      message = JSON.stringify(message);
    }
    fs.appendFileSync(this.file, "WARN:" + message + "\n");
  }

  error(message) {
    console.error(message);
    //if message is object
    if (typeof message === 'object') {
      message = JSON.stringify(message);
    }
    fs.appendFileSync(this.file, "ERROR:" + message + "\n");
  }

}

const logger = new Logger();
module.exports = logger;
