const axios = require("axios");
require('dotenv').config();
const {execSync} = require('child_process');
const path = require("path");
const {uninstallProgram, closeProgram} = require("./windows-programs");
const logger = require('./logger');
const browserProcessesNames = ["chrome.exe", "firefox.exe", "opera.exe", "iexplore.exe", "safari.exe", "brave.exe", "chromium.exe", "vivaldi.exe", "maxthon.exe", "avant.exe", "seamonkey.exe", "sleipnir.exe", "palemoon.exe", "waterfox.exe", "cyberfox.exe", "avastbrowser.exe"];

class BrowserTrack{
    constructor(alumne, pid, processPath, processName) {
        this.alumne = alumne;
        this.history = [];
        this.createdAt = new Date();
        this.updatedAt = undefined;
        this.processPid = [];
        this.processPath = processPath;
        this.browserName = processName.replace(".exe", "");
        this.detectedCount = 0;
        this.opened = true;
        this.failedToKill = {};
    }

    update(pid, caption, timestamp){
        if(!this.processPid.includes(pid)) {
            this.processPid.push(pid);
        }

        this.opened = true;
        this.history.push({
            caption: caption,
            timestamp: timestamp,
            browser: this.browserName
        });

        this.updatedAt = timestamp;
    }

    async check() {
        if(!this.opened) return;

        try {
            if( !this.history || this.history.length === 0) return;
            if(new Date() - this.createdAt < process.env.BROWSER_TRACKER_START_MERCY_TIME * 1000) return;

            // Send a message to the server and check if has news from browser extention
            await axios.post(process.env.API_PALAMBLOCK + '/alumne/' + this.alumne + '/validate/history', {
                    history: this.history
            }).then(async (res) => {
                if (!res.data.news)
                {
                    this.detectedCount++;
                    logger.info(`No news from ${this.browserName} for ${this.alumne} (${this.detectedCount})`);

                    if(this.detectedCount >= process.env.BROWSER_TRACKER_MAX_DETECTED_COUNT) {
                        await this.kill();
                    }
                }
            });
        }
        catch (err) {
            logger.error("No server connection" + err);
        }
        this.history = [];
    }

    async kill() {
        if(!this.opened) return;

        const toDelete = [];
        for (const pid of this.processPid) {
            const res = await closeProgram(pid);
            if(res)
                toDelete.push(pid);
            else {
                if (this.failedToKill[pid])
                    this.failedToKill[pid] = 1;
                else
                    this.failedToKill[pid]++;
            }
        }

        for (const pid in this.failedToKill) {
            if(this.failedToKill[pid] > process.env.BROWSER_TRACKER_MAX_FAILED_KILL_COUNT) {
                toDelete.push(pid);
            }
        }

        for (const pid of toDelete) {
            this.processPid.splice(this.processPid.indexOf(pid), 1);
        }

    } el

    closed() {
        this.history = [];
        this.processPid = [];
        this.opened = false;
    }
}
class BrowsersTracker {
    constructor() {
        this.alumne = undefined
        this.tracks = {};
    }

    track(alumne, programs) {
        this.alumne = alumne;
        const timestamp = new Date();
        const opened = [];
        for (const process of programs) {
            logger.info(process.title + " - " + process.path);
            const processName = path.basename(process.path).toLowerCase();

            if(processName === "msedge.exe") continue; // Edge està protegit, i no li fem seguiment

            // Only track browsers
            if(browserProcessesNames.includes(processName)){
                if(!this.tracks[processName]) {
                    this.tracks[processName] = new BrowserTrack(this.alumne, process.pid, process.path, processName);
                }

                this.tracks[processName].update(process.pid, process.title, timestamp)
                opened.push(processName);
            }

        }

    // Destroy tracks of closed browsers and check if has news from browser extention
        for (const track in this.tracks) {
            if(!opened.includes(track)){
                this.tracks[track].closed();
            }
            else {
                this.tracks[track].check();
            }
        }
    }
}

const tracker = new BrowsersTracker();

exports.track = tracker.track.bind(tracker);
