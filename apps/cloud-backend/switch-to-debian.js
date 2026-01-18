const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function fixImage() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        // 1. Upload new Dockerfile
        const localDocker = path.join(__dirname, 'Dockerfile');
        console.log('Uploading Dockerfile...');
        await ssh.putFile(localDocker, '/root/nadpos-backend/Dockerfile');

        // 2. Upload new schema (simplified)
        const localSchema = path.join(__dirname, 'prisma/schema.prisma');
        console.log('Uploading schema.prisma...');
        await ssh.putFile(localSchema, '/root/nadpos-backend/prisma/schema.prisma');

        // 3. Rebuild App
        // Need to stop first to remove alpine container? No, up --build handles it.
        // But need to ensure apt-get/openssl is installed if needed? node:18-slim includes openssl.
        console.log('--- Rebuilding Backend (Debian) ---');
        const cmd = `cd /root/nadpos-backend && docker-compose build --no-cache app && docker-compose up -d app`;
        console.log(`Running: ${cmd}`);
        await ssh.execCommand(cmd);

        // 4. Wait
        console.log('Waiting for startup (25s)...');
        await new Promise(r => setTimeout(r, 25000));

        // 5. Check Logs
        console.log('--- Checking Logs ---');
        const logs = await ssh.execCommand('docker logs --tail 50 nadpos_backend');
        console.log(logs.stdout || logs.stderr);

        // 6. Test API
        console.log('--- API Test ---');
        const api = await ssh.execCommand('curl -X POST -H "Content-Type: application/json" -d "{}" http://localhost:80/api/auth/login');
        console.log('API Response:', api.stdout || api.stderr);

        ssh.dispose();
    } catch (error) {
        console.error('Fix Image Failed:', error);
    }
}

fixImage();
