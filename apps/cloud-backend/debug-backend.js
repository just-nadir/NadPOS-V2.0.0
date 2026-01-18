const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function checkBackend() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        console.log('--- 1. Check Backend Logs ---');
        // Get last 50 lines
        const logs = await ssh.execCommand('docker logs --tail 50 nadpos_backend');
        console.log('LOGS:', logs.stdout || logs.stderr);

        console.log('--- 2. Force Rebuild & Restart ---');
        // We suspect the volume might not be mounted, so changes to authService.js on host aren't reflected.
        // Or we just want to be sure.

        // Rebuild is safer.
        await ssh.execCommand('docker-compose down', { cwd: '/root/nadpos-backend' });
        await ssh.execCommand('docker-compose up -d --build', { cwd: '/root/nadpos-backend' });

        console.log('Backend restarted with forced build.');

        ssh.dispose();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkBackend();
