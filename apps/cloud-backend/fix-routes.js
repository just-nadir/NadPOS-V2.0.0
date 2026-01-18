const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function fixRoutes() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        // 1. Upload fixed adminRoutes.js
        const localFile = path.join(__dirname, 'src/routes/adminRoutes.js');
        console.log('Uploading fixed adminRoutes.js...');
        await ssh.putFile(localFile, '/root/nadpos-backend/src/routes/adminRoutes.js');

        // 2. Restart App (No explicit build needed if we just replaced a JS file and are using node runtime, but since we are copying into the image.... wait)
        // We are using 'docker-compose up' which mounts volumes?
        // Let's check docker-compose.yml content again.
        // If we DON'T map a volume for 'src', then we DO need to rebuild.
        // Usually production docker-compose doesn't map 'src'.

        console.log('--- Rebuilding Service: app ---');
        // We'll rebuild to be safe and ensure the COPY . . picks up the new file
        // BUT we need to upload the file to /root/nadpos-backend/src/routes first (which we just did)

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
        console.error('Fix Routes Failed:', error);
    }
}

fixRoutes();
