const Install = require('node-windows').Service;
const workerfullPath = require('path').join(__dirname, 'src/worker.js');

const svc = new Install({
    name: 'PalamOS',
    description: 'Servei de sistema de PalamBlock per a Windows',
    script: workerfullPath,
    //allowServiceLogon: true
});

//svc.logOnAs.account = 'user';
//svc.logOnAs.password = 'password';


svc.on('install', () => {
    svc.start();
});

svc.install();


