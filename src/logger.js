const fs = require('fs');
class Logger {
  constructor() {
    this.file = "palamOS.log"
  }

  info(message) {
    console.log(message);
    fs.appendFileSync(this.file, "INFO:" + message + "\n");
  }

  warn(message) {
    console.warn(message);
    fs.appendFileSync(this.file, "WARN:" + message + "\n");
  }

  error(message) {
    console.error(message);
    fs.appendFileSync(this.file, "ERROR:" + message + "\n");
  }

}

const logger = new Logger();
module.exports = logger;
