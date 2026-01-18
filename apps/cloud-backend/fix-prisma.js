const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function fixPrisma() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        // 1. Upload new Dockerfile
        const localDockerfile = path.join(__dirname, 'Dockerfile');
        console.log('Uploading corrected Dockerfile...');
        await ssh.putFile(localDockerfile, '/root/nadpos-backend/Dockerfile');

        // 2. Rebuild
        console.log('--- Rebuilding Service: app ---');
        const cmd = `cd /root/nadpos-backend && docker-compose up -d --build app`;
        console.log(`Running: ${cmd}`);

        await ssh.execCommand(cmd);

        // 3. Wait and Log
        console.log('Waiting for startup (15s)...');
        await new Promise(r => setTimeout(r, 15000));

        console.log('--- Checking Logs ---');
        const logs = await ssh.execCommand('docker logs --tail 50 nadpos_backend');
        console.log(logs.stdout || logs.stderr);

        console.log('--- Checking Port ---');
        const port = await ssh.execCommand('netstat -tulnp | grep 4000');
        console.log('Internal Port Check:', port.stdout);

        ssh.dispose();
    } catch (error) {
        console.error('Fix Prisma Failed:', error);
    }
}

fixPrisma();
