require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {sendPrograms} = require('./com-with-server');
const logger = require('./logger');

let username = 'unknown';

if(process.env.AUTO_UPDATE === "True") {
    const AutoGitUpdate = require('auto-git-update');

    const config = {
        repository: process.env.GIT_REPO,
        fromReleases: true,
        tempLocation: 'C:\\tmp',
        ignoreFiles: [],
        executeOnComplete: 'shutdown /r /c "S\'ha actualitzat PalamBlock. L\'ordinador es reiniciarà en breu"\n',
        exitOnComplete: true
    }

    const updater = new AutoGitUpdate(config);
    updater.autoUpdate();
}

// Get version from package.json
const {version} = require('../package.json');
logger.info("Starting PalamOS worker version " + version);

try {
    // Check login on hidden file
    username = fs.readFileSync(path.join(__dirname, 'login.txt'), 'utf8');
} catch (err) {
    // No login file, create one
    require('./login-launcher')
}

// Auto send programs on start
sendPrograms(username); // debugging

try {
    setInterval(async () => {
        try {
            await sendPrograms(username);
        } catch (err) {
            console.error(err);
        }
    }, process.env.UPDATE_INTERVAL * 1000)
}
catch (err) {
    logger.error(err);
    throw err;
}
