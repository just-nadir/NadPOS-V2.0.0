const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const ssh = new NodeSSH();

// VPS Config
const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998',
};

const REMOTE_DIR = '/root/nadpos-backend';

(async () => {
    try {
        console.log('🔗 Connecting to VPS...');
        await ssh.connect(config);
        console.log('✅ Connected!');

        // 1. Upload Nginx Config
        console.log('📤 Uploading Nginx config...');
        const nginxLocal = 'nginx/default.conf';
        const nginxRemote = `${REMOTE_DIR}/nginx/default.conf`;

        // Ensure remote nginx dir exists
        await ssh.execCommand(`mkdir -p ${REMOTE_DIR}/nginx`);

        await ssh.putFile(nginxLocal, nginxRemote);

        // 2. Upload Docker Compose (Updated)
        console.log('📤 Uploading updated Docker Compose...');
        await ssh.putFile('docker-compose.yml', `${REMOTE_DIR}/docker-compose.yml`);

        // 3. Reload Nginx
        console.log('🔄 Reloading Nginx...');
        // We need to re-create nginx container to pick up new ports and volumes
        await ssh.execCommand('docker-compose up -d --force-recreate --no-deps nginx', { cwd: REMOTE_DIR });

        console.log('✨ Domain Configured! Check http://nadpos.uz');
        ssh.dispose();

    } catch (error) {
        console.error('❌ Error:', error);
        ssh.dispose();
    }
})();
