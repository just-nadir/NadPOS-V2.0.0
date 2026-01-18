const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function debugListen() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        // 1. Upload new server.js
        const localFile = path.join(__dirname, 'src/server.js');
        console.log('Uploading debug server.js...');
        await ssh.putFile(localFile, '/root/nadpos-backend/src/server.js');

        // 2. Restart App
        console.log('--- Restarting Backend ---');
        // Rebuild is simpler to ensure copy, but we can restart if we mapped src?
        // We do NOT map src in docker-compose usually.
        // Wait, did I map src?
        // docker-compose.yml: volumes: - ./data:/app/data
        // So NO. I MUST REBUILD.

        const cmd = `cd /root/nadpos-backend && docker-compose up -d --build app`;
        console.log(`Running: ${cmd}`);

        await ssh.execCommand(cmd);

        // 3. Wait and Log
        console.log('Waiting for startup (10s)...');
        await new Promise(r => setTimeout(r, 10000));

        console.log('--- Checking Logs ---');
        const logs = await ssh.execCommand('docker logs --tail 100 nadpos_backend');
        console.log(logs.stdout || logs.stderr);

        ssh.dispose();
    } catch (error) {
        console.error('Debug Listen Failed:', error);
    }
}

debugListen();
