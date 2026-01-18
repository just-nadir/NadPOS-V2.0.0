const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function fixBinaryV2() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        // 1. Upload new schema.prisma
        const localFile = path.join(__dirname, 'prisma/schema.prisma');
        console.log('Uploading schema.prisma...');
        await ssh.putFile(localFile, '/root/nadpos-backend/prisma/schema.prisma');

        // 2. Verify Content
        console.log('--- Verify Content ---');
        const cat = await ssh.execCommand('cat /root/nadpos-backend/prisma/schema.prisma | head -n 5');
        console.log(cat.stdout);

        // 3. Rebuild App
        console.log('--- Rebuilding Backend ---');
        // Force rebuild without cache might be needed if COPY is cached?
        // docker-compose build --no-cache app ?
        const cmd = `cd /root/nadpos-backend && docker-compose build --no-cache app && docker-compose up -d app`;
        console.log(`Running: ${cmd}`);
        await ssh.execCommand(cmd);

        // 4. Wait
        console.log('Waiting for startup (20s)...');
        await new Promise(r => setTimeout(r, 20000));

        // 5. Test API
        console.log('--- API Test ---');
        const api = await ssh.execCommand('curl -X POST -H "Content-Type: application/json" -d "{}" http://localhost:80/api/auth/login');
        console.log('API Response:', api.stdout || api.stderr);

        ssh.dispose();
    } catch (error) {
        console.error('Fix Binary V2 Failed:', error);
    }
}

fixBinaryV2();
