const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');
const path = require('path');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function fixAndRedeploy() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        // 1. Upload new Dockerfile
        const localDockerfile = path.join(__dirname, 'Dockerfile');
        console.log('Uploading corrected Dockerfile...');
        await ssh.putFile(localDockerfile, '/root/nadpos-backend/Dockerfile');

        // 2. Rebuild and Restart
        console.log('--- Rebuilding Container ---');
        // docker-compose up -d --build nadpos_backend
        // Check for docker-compose or docker compose
        const composeCmd = 'docker-compose'; // We saw it works earlier
        const cmd = `cd /root/nadpos-backend && ${composeCmd} up -d --build nadpos_backend`;

        console.log(`Running: ${cmd}`);
        const result = await ssh.execCommand(cmd);
        console.log(result.stdout || result.stderr);

        // 3. Check logs
        console.log('--- Checking Logs ---');
        // Wait a few seconds for startup
        await new Promise(r => setTimeout(r, 5000));
        const logs = await ssh.execCommand('docker logs --tail 20 nadpos_backend');
        console.log(logs.stdout || logs.stderr);

        ssh.dispose();
    } catch (error) {
        console.error('Fix Failed:', error);
    }
}

fixAndRedeploy();
