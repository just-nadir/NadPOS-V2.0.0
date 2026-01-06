const electron = require('electron');
console.log('Electron require result keys:', Object.keys(electron));
console.log('process.versions:', process.versions);
console.log('ELECTRON_RUN_AS_NODE env:', process.env.ELECTRON_RUN_AS_NODE);
console.log('Is app defined?', !!electron.app);
if (electron.app) {
    console.log('App successfully loaded');
    electron.app.quit();
} else {
    console.error('CRITICAL: app is undefined');
    process.exit(1);
}
