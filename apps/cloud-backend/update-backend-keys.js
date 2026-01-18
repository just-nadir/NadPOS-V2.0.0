const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function updateBackendkeys() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        console.log('--- 1. Upload Private Key ---');
        await ssh.putFile(path.join(__dirname, 'private.pem'), '/root/nadpos-backend/private.pem');
        // Copy to container volume? 
        // We mounted `. -> /app`. So putting it in /root/nadpos-backend/ needs to be accessible.
        // Wait, docker-compose normally mounts using ./ : /app
        // So /root/nadpos-backend/private.pem IS accessible at /app/private.pem inside container.

        console.log('--- 2. Upload Updated authService.js ---');
        await ssh.putFile(
            path.join(__dirname, 'src/services/authService.js'),
            '/root/nadpos-backend/src/services/authService.js'
        );

        console.log('--- 3. Restart Backend to apply changes ---');
        await ssh.execCommand('docker-compose restart app', { cwd: '/root/nadpos-backend' });

        console.log('backend updated with RSA keys.');

        ssh.dispose();
    } catch (error) {
        console.error('Update Failed:', error);
    }
}

updateBackendkeys();
