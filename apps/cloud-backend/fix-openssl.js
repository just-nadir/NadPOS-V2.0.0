const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function fixOpenSSL() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        // 1. Upload new Dockerfile
        const localDocker = path.join(__dirname, 'Dockerfile');
        console.log('Uploading Dockerfile...');
        await ssh.putFile(localDocker, '/root/nadpos-backend/Dockerfile');

        // 2. Rebuild App
        console.log('--- Rebuilding Backend (Debian + OpenSSL) ---');
        const cmd = `cd /root/nadpos-backend && docker-compose build --no-cache app && docker-compose up -d app`;
        console.log(`Running: ${cmd}`);
        await ssh.execCommand(cmd);

        // 3. Wait
        console.log('Waiting for startup (30s)...');
        await new Promise(r => setTimeout(r, 30000));

        // 4. API Test
        console.log('--- API Test ---');
        const api = await ssh.execCommand('curl -X POST -H "Content-Type: application/json" -d "{}" http://localhost:80/api/auth/login');
        console.log('API Response:', api.stdout || api.stderr);

        ssh.dispose();
    } catch (error) {
        console.error('Fix OpenSSL Failed:', error);
    }
}

fixOpenSSL();
