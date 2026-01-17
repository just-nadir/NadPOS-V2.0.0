const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };
const REMOTE_DIR = '/root/nadpos-backend';

(async () => {
    try {
        await ssh.connect(config);
        console.log('🔒 Activating HTTPS...');

        // 1. Swap Config
        await ssh.putFile('nginx/https.conf', `${REMOTE_DIR}/nginx/default.conf`);
        await ssh.putFile('docker-compose.yml', `${REMOTE_DIR}/docker-compose.yml`);

        // 2. Start Nginx (Force recreate to ensure config pick up)
        await ssh.execCommand('docker-compose up -d --force-recreate nginx', { cwd: REMOTE_DIR });

        console.log('✨ HTTPS Activated!');
        ssh.dispose();
    } catch (e) { console.error(e); ssh.dispose(); }
})();
