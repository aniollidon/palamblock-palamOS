const iconExtractor = require("extract-file-icon");
const { listOpenWindows } = require('@josephuspaye/list-open-windows');
const si = require('systeminformation');
const path = require('path');
const {execSync} = require("child_process");
const {getInstalledApps} = require("get-installed-apps");
const fs = require("fs");
const logger = require('./logger');

const ApplicationFrameWindowApps = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "assets",  "ApplicationFrameWindow-apps.json"), 'utf8'));


async function _getCurrentPrograms_legacy(){
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

function _getCurrentPrograms() {
    return new Promise(async (resolve, reject) => {
        var exec = require('child_process').exec;
        const allProcesses = await si.processes();

        // Execute the 'tasklist' command with the specified filters and format
        //'tasklist /v /fo csv /NH /fi  "STATUS eq RUNNING" | findstr /V /I /C:"N/D"'
        exec('tasklist /v /fo csv /NH /fi  "STATUS eq RUNNING"', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return;
            }

            if (stderr) {
                console.error(`Error: ${stderr}`);
                return;
            }

            // Split the output into lines
            const lines = stdout.split('\r\n');
            // Remove the last line, which is empty
            lines.pop();
            // Split each csv line into an array of columns
            const processes = lines.map(line => line.split('","'));
            // Extract the process name from each line
            const processNames = processes.map(process => process[0].replace('"', ''));
            const processIds = processes.map(process => process[1]);
            const processTitles = processes.map(process => process[8].replace('"', ''));

            // create a dict with the process name as key and the process id as value
            let significativeProcesses = {};
            const skipTitles = ["N/A", "N/D", "", "OleMainThreadWndName", "OLEChannelWnd"];

            for (let i = 0; i < processNames.length; i++) {

                if (!significativeProcesses[processNames[i]])
                    significativeProcesses[processNames[i]] = {
                        name: processNames[i],
                        pid: [parseInt(processIds[i])],
                        title: skipTitles.includes(processTitles[i]) ? [] : [processTitles[i]]
                    }
                else {
                    significativeProcesses[processNames[i]].pid.push(parseInt(processIds[i]));

                    // check skip titles
                    if (!skipTitles.includes(processTitles[i]))
                        significativeProcesses[processNames[i]].title.push(processTitles[i]);
                }
            }

            // Elimina els que no tenen títol
            for (let key in significativeProcesses) {
                if (significativeProcesses[key].title.length === 0)
                    delete significativeProcesses[key];
            }

            // Busca el path dels processos
            for (let key in significativeProcesses) {
                const proc = allProcesses.list.find((proc) => proc.name === key);
                if (proc) {
                    significativeProcesses[key].processPath = [proc.path];
                    significativeProcesses[key].parentPid = proc.parentPid;
                }
            }

            // Get processName for parentPid
            for (let key in significativeProcesses) {
                const proc = allProcesses.list.find((proc) => proc.pid === significativeProcesses[key].parentPid);
                if (proc) {
                    significativeProcesses[key].parentName = proc.name;
                }
            }

            // Si el parent no és explorer.exe, svchost.exe o winlogon.exe i és coincident agrupa'ls
            for (let key in significativeProcesses) {
                if (significativeProcesses[key].parentName !== 'explorer.exe' &&
                    significativeProcesses[key].parentName !== 'svchost.exe' &&
                    significativeProcesses[key].parentName !== 'winlogon.exe') {
                    const parentname = significativeProcesses[key].parentName;
                    const parent = significativeProcesses[parentname];
                    if (parent) {
                        parent.pid = parent.pid.concat(significativeProcesses[key].pid);
                        parent.title = parent.title.concat(significativeProcesses[key].title);
                        parent.processPath = parent.processPath.concat(significativeProcesses[key].processPath);
                        delete significativeProcesses[key];
                    }
                    else if(parentname){
                        // Create parent
                        significativeProcesses[significativeProcesses[key].parentName] = {
                            name: significativeProcesses[key].parentName,
                            pid: significativeProcesses[key].pid,
                            title: significativeProcesses[key].title,
                            processPath: significativeProcesses[key].processPath,
                        }

                        significativeProcesses[significativeProcesses[key].parentName].pid.push(significativeProcesses[key].parentPid);
                        delete significativeProcesses[key];
                    }
                }
            }

            // Canvia els titols dels CicMarshalWnd pel nom de l'aplicació sense extensió
            for (let key in significativeProcesses) {
                if (significativeProcesses[key].title[0].includes('CicMarshalWnd')) {
                    significativeProcesses[key].title[0] = path.parse(significativeProcesses[key].name).name;
                    significativeProcesses[key].relevant = true;
                }
            }

            // si és o el parent és svchost.exe, services.exe o winlogon.exe marca com irrelevant
            for (let key in significativeProcesses) {
                if (significativeProcesses[key].name === 'svchost.exe' ||
                    significativeProcesses[key].name === 'services.exe' ||
                    significativeProcesses[key].name === 'winlogon.exe' ||
                    significativeProcesses[key].parentName === 'svchost.exe' ||
                    significativeProcesses[key].parentName === 'services.exe' ||
                    significativeProcesses[key].parentName === 'winlogon.exe') {
                    if(significativeProcesses[key].relevant === undefined)
                        significativeProcesses[key].relevant = false
                }
            }

            // Si el parent és explorer.exe marca com a relevant
            for (let key in significativeProcesses) {
                if (significativeProcesses[key].parentName === 'explorer.exe') {
                    significativeProcesses[key].relevant = true;
                }
            }

            for (let key in significativeProcesses) {
                // Si no està marcat com a irrelevant, marca com a relevant
                if(significativeProcesses[key].relevant === undefined)
                    significativeProcesses[key].relevant = true;
                // Filtra els processPath en blanc
                if( significativeProcesses[key].processPath)
                significativeProcesses[key].processPath = significativeProcesses[key].processPath.filter((path) => path !== '');
            }

            console.log(significativeProcesses);
            resolve(significativeProcesses);
        });
    });
}

async function getCurrentPrograms(){
    const programs = await _getCurrentPrograms();

    // Prepare the list of programs to send
    const windowsPrograms = [];
    for (let pname of Object.keys(programs)) {
        const program = programs[pname];
        let icon = program.iconSVG;
        let iconType = 'svg';

        if(!program.relevant || icon)
        {
            // do nothing
        }
        else if(ApplicationFrameWindowApps[program.name]) {
            icon = ApplicationFrameWindowApps[program.name].iconSVG;
            iconType = 'svg';
        }
        else if(!program.iconSVG && program.processPath) {
            if(program.processPath[0] && program.processPath[0].endsWith('.exe')) {
                const iconBuffer = await getIcon(program.processPath[0]);
                icon = iconBuffer.toString('base64');
                iconType = 'base64';
            }
        }
        windowsPrograms.push({
            name: program.name,
            title: program.title.join(' - '),
            path: program.processPath[0],
            icon: icon,
            iconType: iconType,
            pid: program.pid,
            onTaskBar: program.relevant,
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
