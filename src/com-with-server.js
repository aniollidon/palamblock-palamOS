
const browserTracker = require("./browsers-tracker.js");
const axios = require("axios");
const {getCurrentPrograms, closeProgram, uninstallProgram} = require('./windows-programs');
const logger = require('./logger');


async function sendPrograms(username){
    if(username === 'unknown') return;

    const programs = await getCurrentPrograms();

    // Track browsers
    browserTracker.track(username, programs);

    logger.info("Sending programs");
    await axios.post(process.env.API_PALAMBLOCK + '/validacio/apps', {
        apps: programs,
        alumne: username
    }).then(async (res) => {
        const doList = res.data.do;

        for (const process of programs) {
            if(!doList[process.pid]) continue;

            if (doList[process.pid] === 'close' || doList[process.pid] === 'block' || doList[process.pid].includes('uninstall')) {
                await closeProgram(process.pid);
            }
            if (doList[process.pid].includes('uninstall')) {
                let force = doList[process.pid].includes('force_uninstall');
                let uninstalled = await uninstallProgram(process, force);

                if(!uninstalled){
                    // No s'ha pogut desinstal·lar
                    axios.post(process.env.API_PALAMBLOCK + '/apps/uninstall', {
                        app: process,
                        status: 'error',
                        alumne: username
                    }).then((res) => {
                        logger.info(res.data);
                    }).catch((err) => {
                        logger.error(err);
                    });
                }
            }
        }
    }).catch((err) => {
        logger.error("Server not found");
    });
}

module.exports = {
    sendPrograms
};
