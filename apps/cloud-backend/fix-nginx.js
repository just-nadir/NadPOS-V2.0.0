const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function fixNginx() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        // 1. Upload new Nginx Config
        const localConf = path.join(__dirname, 'nginx/default.conf');
        console.log('Uploading Nginx Config...');
        // Ensure directory exists (it should, mapped via volume, but verifying path)
        // The volume is ./nginx:/etc/nginx/conf.d
        // So we need to put it in /root/nadpos-backend/nginx/default.conf
        await ssh.putFile(localConf, '/root/nadpos-backend/nginx/default.conf');

        // 2. Restart Nginx
        console.log('--- Restarting Nginx ---');
        const cmd = `cd /root/nadpos-backend && docker-compose restart nginx`;
        console.log(`Running: ${cmd}`);

        await ssh.execCommand(cmd);

        // 3. Wait and Test
        console.log('Waiting for restart (5s)...');
        await new Promise(r => setTimeout(r, 5000));

        console.log('--- Curl Test (Localhost) ---');
        const curl = await ssh.execCommand('curl -I http://localhost:80');
        console.log(curl.stdout || curl.stderr);

        ssh.dispose();
    } catch (error) {
        console.error('Fix Nginx Failed:', error);
    }
}

fixNginx();
