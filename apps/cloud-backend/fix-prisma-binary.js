const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function fixBinary() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        // 1. Upload new schema.prisma
        const localFile = path.join(__dirname, 'prisma/schema.prisma');
        console.log('Uploading schema.prisma...');
        await ssh.putFile(localFile, '/root/nadpos-backend/prisma/schema.prisma');

        // 2. Rebuild App
        // This will run 'npx prisma generate' inside Dockerfile with the new schema
        console.log('--- Rebuilding Backend ---');
        const cmd = `cd /root/nadpos-backend && docker-compose up -d --build app`;
        console.log(`Running: ${cmd}`);
        await ssh.execCommand(cmd);

        // 3. Wait and Log
        console.log('Waiting for startup (15s)...');
        await new Promise(r => setTimeout(r, 15000));

        console.log('--- Checking Logs ---');
        const logs = await ssh.execCommand('docker logs --tail 50 nadpos_backend');
        console.log(logs.stdout || logs.stderr);

        // 4. Test API again
        console.log('--- API Test ---');
        const api = await ssh.execCommand('curl -X POST -H "Content-Type: application/json" -d "{}" http://localhost:80/api/auth/login');
        console.log('API Response:', api.stdout || api.stderr);

        ssh.dispose();
    } catch (error) {
        console.error('Fix Binary Failed:', error);
    }
}

fixBinary();
