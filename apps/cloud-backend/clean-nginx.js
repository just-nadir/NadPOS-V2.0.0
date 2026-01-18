const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function cleanNginx() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        // 1. Remove old configs
        console.log('Removing old configs...');
        await ssh.execCommand('rm /root/nadpos-backend/nginx/http.conf');
        await ssh.execCommand('rm /root/nadpos-backend/nginx/https.conf');

        // 2. Restart Nginx
        console.log('--- Restarting Nginx ---');
        await ssh.execCommand('cd /root/nadpos-backend && docker-compose restart nginx');

        // 3. Wait and Test
        console.log('Waiting for restart (5s)...');
        await new Promise(r => setTimeout(r, 5000));

        console.log('--- Curl Test (Localhost) ---');
        const curl = await ssh.execCommand('curl -I http://localhost:80');
        console.log(curl.stdout || curl.stderr);

        console.log('--- Check PWD ---');
        const pwd = await ssh.execCommand('curl -v http://localhost:4000');
        console.log('Backend Check:', pwd.stdout.substring(0, 100)); // First 100 chars

        ssh.dispose();
    } catch (error) {
        console.error('Clean Failed:', error);
    }
}

cleanNginx();
