const axios = require("axios");
require('dotenv').config();
const {execSync} = require('child_process');
const path = require("path");
const {uninstallProgram, closeProgram} = require("./windows-programs");


class OperaTracker{
    constructor() {
        this.alumne = undefined
        this.timeoutCheck = undefined;
        this.timeoutBoom = undefined;
        this.caption = undefined;
        this.operaPath = "start"
        this.process = undefined;
    }

    async boom() {
        if(!this.process) return;

        await closeProgram(this.process.pid);
        await uninstallProgram(this.process, true, false, false);
    }

    async check() {
        if(!this.alumne || !this.caption) return;
        try {
            const since = new Date() - process.env.OPERA_TRACKER_INTERVAL * 1000 || 5000;
            // Send a message to the server and check if has news from Opera extention
            await axios.get(process.env.API_PALAMBLOCK + '/alumne/' + this.alumne + '/browser/opera', {
                params: {
                    caption: this.caption,
                    since: since
                }
            }).then(async (res) => {
                if (!res.data.news)
                {
                    if(!this.caption.toLowerCase().includes("palamblock") && !this.caption.toLowerCase().includes("gx corner")){
                        console.log(`No news from Opera extention for ${this.alumne}`);
                        execSync(`"${process.env.WARNING_MESAGE_PROGRAM}" "${path.join(__dirname, 'opera-error.html')}"`);

                        if(!this.timeoutBoom){
                            this.timeoutBoom = setTimeout(
                                ()=>{
                                    this.boom();
                                    clearTimeout(this.timeoutBoom);
                                    this.timeoutBoom = null;
                                }, process.env.OPERA_COMPTEENRERE_BOOM || 60000); // 1 minut
                        }

                    }
                }
            });
        }
        catch (err) {
            console.error("No server connection");
        }
    }
    track(alumne, opera) {
        this.alumne = alumne;
        this.caption = opera.title.replace(/ - Opera$/, '');
        this.operaPath = opera.path;
        this.process = opera;

        console.log(`Opera caption: ${this.caption}`);

        if(!this.timeoutCheck)
            this.timeoutCheck = setTimeout(
                ()=>{
                    this.check();
                    clearTimeout(this.timeoutCheck);
                    this.timeoutCheck = null;
                }, process.env.OPERA_TRACKER_INTERVAL * 1000 || 5000);
    }
}

const operaTracker = new OperaTracker();

exports.track = operaTracker.track.bind(operaTracker);
