require('dotenv').config();
const fs = require('fs');
const path = require('path');
const otrk = require('./opera-tracker');
const axios = require("axios");
const {getCurrentPrograms, closeProgram, uninstallProgram} = require('./windows-programs');

let username = 'unknown';


try {
    // Check login on hidden file
    username = fs.readFileSync(path.join(__dirname, 'login.txt'), 'utf8');
} catch (err) {
    // No login file, create one
    require('./login-launcher')
}

async function sendPrograms(){
    if(username === 'unknown') return;

    const programs = await getCurrentPrograms();

    // Track Opera program
    const opera = programs.find((proc) => proc.path.toLowerCase().includes('opera'));

    if(opera)
        otrk.track(username, opera);

    console.log("Sending programs");
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
                        console.log(res.data);
                    }).catch((err) => {
                        console.error(err);
                    });
                }
            }
        }
    }).catch((err) => {
        console.error("Server not found");
    });
}


// Auto send programs on start
sendPrograms(); // debugging pourpouses


setInterval(async ()=>{
    try{
        await sendPrograms();
    }
    catch(err){
        console.error(err);
    }
}, process.env.UPDATE_INTERVAL * 1000)

