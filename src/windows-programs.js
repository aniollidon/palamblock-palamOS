const iconExtractor = require("extract-file-icon");
const { listOpenWindows } = require('@josephuspaye/list-open-windows');
const si = require('systeminformation');
const path = require('path');
const {execSync} = require("child_process");
const {getInstalledApps} = require("get-installed-apps");
const fs = require("fs");
const logger = require('./logger');

async function _getCurrentPrograms(){
    // Get the list of open windows
    const windows = listOpenWindows();

    if(windows.find((win) => {
        return win.className === 'ApplicationFrameWindow' || win.className === 'MMCMainFrame' })) {

        // Search all process & get ApplicationFrameWindow process
        const allProcesses = await si.processes();
        const afw = allProcesses.list.find((proc) => proc.name === 'ApplicationFrameHost.exe');

        // update the list of Windows apps
        return await updateWindowsAppDetails(windows, allProcesses, afw);
    }

    return windows;
}

async function getCurrentPrograms(){
    const programs = await _getCurrentPrograms();

    // Prepare the list of programs to send
    const windowsPrograms = [];
    for (let program of programs) {
        let icon = program.iconSVG;
        let iconType = 'svg';

        if(!program.iconSVG) {
            const iconBuffer = await getIcon(program.processPath);
            icon = iconBuffer.toString('base64');
            iconType = 'base64';
        }
        windowsPrograms.push({
            name: path.basename(program.processPath),
            title: program.caption,
            path: program.processPath,
            icon: icon,
            iconType: iconType,
            pid: program.processId
        });
    }

    return windowsPrograms;
}

function getIcon(path){
    let buffer = iconExtractor(path, 64);
    if(!buffer.length)
        buffer = iconExtractor(path, 32);
    if(!buffer.length)
        buffer = iconExtractor(path, 16);
    return buffer;
}

async function updateWindowsAppDetails(winapps, allprocesses, afw){
    if(!afw) return [];

    const appsList = allprocesses.list.filter((proc) => proc.parentPid === afw.parentPid);

    // load from json
    const matchlist = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "assets",  "ApplicationFrameWindow-apps.json"), 'utf8'));

    for (const app of winapps) {
        if(app.className === 'TaskManagerWindow') {
            app.hide = true;
            continue;
        }
        if(app.className === 'MMCMainFrame') {
            app.hide = true;
            continue;
        }
        if(app.className !== 'ApplicationFrameWindow') continue;
        const appName = app.caption.toLowerCase();
        let iconSVG = undefined;
        let appData = appsList.find((proc) => path.parse(proc.name).name.toLowerCase().includes(appName));

        if(!appData && matchlist[appName]){
            if(matchlist[appName].hide) {
                app.hide = true;
                continue;
            }

            appData = appsList.find((proc) => proc.name.toLowerCase().includes(matchlist[appName].tip));
            iconSVG = matchlist[appName].iconSVG;
        }

        if(appData) {

            if(!fs.existsSync(appData.path))
                app.processPath = path.join(appData.path, '..', appData.name);
            else if(fs.lstatSync(appData.path).isDirectory())
                app.processPath = path.join(appData.path, appData.name);
            else
                app.processPath = appData.path;

            app.name = appData.name;
            app.className = appName;
            app.processId = appData.pid;
            app.iconSVG = iconSVG;
        }
    }

    // Filter hidden apps
    return winapps.filter((app) => !app.hide);
}

function closeProgram(pid){
    try {
        // Tanca el procés
        const res = execSync(`taskkill /PID ${pid} /F`);
        return res.length > 0;
    }
    catch (err) {
        logger.error(`Error closing program ${pid}: ` + err);

        return false;
    }
}

async function uninstallProgram(process, force=false, nice= true, niceapp = true){
    const nameNoExt = path.parse(process.name).name;
    let uninstalled = false;

    if(niceapp) {
        // Primer prova de desintal·lar si s'ha instal·lat per la store
        try {
            const res = execSync("powershell -command \"Get-AppxPackage | Where-Object { $_.Name -like \\\"*" + nameNoExt + "*\\\" } | ForEach-Object { Remove-AppxPackage -Package $_.PackageFullName }\"")
            uninstalled = res.length > 0;
        } catch (err) {
            logger.error(`Error uninstalling ${process.name} with powershell: ` + err);
        }
    }

    if(!uninstalled && nice){
        // Segon mètode: Busca i fes corre l'uninstal·lador
        const apps = await getInstalledApps();
        const appDir = path.dirname(process.path);
        const apptodelete = apps.find((app) =>
            (app.InstallLocation? app.InstallLocation : app.InstallSource) === appDir);
        if(apptodelete){
            try {
                if(apptodelete.UninstallString) {
                    const res = execSync(apptodelete.UninstallString);
                    uninstalled = res.length > 0;
                }
            }
            catch (err) {
                logger.error(`Error uninstalling ${process.name} with uninstaller: ` + err);
                // Torna a provar amb el paràmetre --force-uninstall
                if(apptodelete.UninstallString) {
                    const res = execSync(apptodelete.UninstallString + " --force-uninstall");
                    uninstalled = res.length > 0;
                }
            }
        }
    }

    if(!uninstalled && force){
        // Tercer mètode: Esborra el contingut de l'executable

        const protectedDirs = [ // Directoris protegits
            "C:\\Windows\\",
            "C:\\Program Files\\",
            "C:\\Program Files (x86)\\",
        ];

        if(!protectedDirs.find((dir) => process.path.startsWith(dir))) {
            try{
                closeProgram(process.pid);
                // Destrossa el programa ☠ UAHAHAHA!
                fs.writeFileSync(process.path, "");
                uninstalled = true;
            }
            catch (err) {
                logger.error(`Error uninstalling ${process.name} with delete: ` + err);
            }
        }
    }

    return uninstalled;
}

module.exports = {
    getCurrentPrograms,
    closeProgram,
    uninstallProgram
}
