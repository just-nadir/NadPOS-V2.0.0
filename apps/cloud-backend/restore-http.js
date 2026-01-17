const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };
const REMOTE_DIR = '/root/nadpos-backend';

(async () => {
    try {
        await ssh.connect(config);
        console.log('🔄 Restoring HTTP...');

        // 1. Restore Config
        await ssh.putFile('nginx/http.conf', `${REMOTE_DIR}/nginx/default.conf`);
        await ssh.putFile('docker-compose.yml', `${REMOTE_DIR}/docker-compose.yml`);

        // 2. Start Nginx
        // Ensure certbot service is gone (local docker-compose.yml should be fixed now)
        await ssh.execCommand('docker-compose up -d --remove-orphans nginx', { cwd: REMOTE_DIR });

        console.log('✨ HTTP Restored!');
        ssh.dispose();
    } catch (e) { console.error(e); ssh.dispose(); }
})();
