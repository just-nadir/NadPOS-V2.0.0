const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function setupSslPhase2() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        console.log('--- 1. Copy Certificates to Docker Volume ---');
        // Host /etc/letsencrypt -> Host ./certbot/conf
        // We use cp -RL to follow symlinks (essential for live/ certs)
        await ssh.execCommand('cp -RL /etc/letsencrypt/* /root/nadpos-backend/certbot/conf/');

        console.log('Certs copied.');

        console.log('--- 2. Upload New Nginx Config (SSL) ---');
        const localConf = path.join(__dirname, 'nginx/default.conf');
        await ssh.putFile(localConf, '/root/nadpos-backend/nginx/default.conf');

        console.log('--- 3. Reload Nginx ---');
        const reload = await ssh.execCommand('docker exec nadpos_nginx nginx -s reload');
        console.log(reload.stdout || reload.stderr);

        console.log('--- 4. Verify HTTPS ---');
        const curl = await ssh.execCommand('curl -I https://nadpos.uz');
        console.log(curl.stdout || curl.stderr);

        ssh.dispose();
    } catch (error) {
        console.error('SSL Phase 2 Failed:', error);
    }
}

setupSslPhase2();
