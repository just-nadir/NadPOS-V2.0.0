const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function audit() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        console.log('\n=== 1. DOCKER CONTAINERS STATUS ===');
        const containers = await ssh.execCommand('docker ps -a');
        console.log(containers.stdout || containers.stderr);

        console.log('\n=== 2. NGINX LOGS (Last 50) ===');
        const nginxLogs = await ssh.execCommand('docker logs --tail 50 nadpos_nginx');
        console.log(nginxLogs.stdout || nginxLogs.stderr);

        console.log('\n=== 3. BACKEND LOGS (Last 50) ===');
        const backendLogs = await ssh.execCommand('docker logs --tail 50 nadpos_backend');
        console.log(backendLogs.stdout || backendLogs.stderr);

        console.log('\n=== 4. PUBLIC FOLDER CHECK ===');
        // Check if index.html exists in the public folder used by Nginx/Backend
        // Nginx or Backend might be serving static files. 
        // Let's check where 'public' is mounted or copied in the container.
        // On host:
        const publicFiles = await ssh.execCommand('ls -l /root/nadpos-backend/public');
        console.log(publicFiles.stdout || publicFiles.stderr);

        const assets = await ssh.execCommand('ls -l /root/nadpos-backend/public/assets');
        console.log('Assets:', assets.stdout || assets.stderr);

        console.log('\n=== 5. INTERNAL CURL TESTS ===');
        // Can host reach Nginx?
        const curlNginx = await ssh.execCommand('curl -I http://localhost:80');
        console.log('Curl Localhost:80 ->', curlNginx.stdout || curlNginx.stderr);

        const curlBackend = await ssh.execCommand('curl -I http://localhost:4000');
        console.log('Curl Localhost:4000 ->', curlBackend.stdout || curlBackend.stderr);

        console.log('\n=== 6. NGINX CONFIG CHECK ===');
        const nginxConf = await ssh.execCommand('cat /root/nadpos-backend/nginx/default.conf');
        console.log(nginxConf.stdout || nginxConf.stderr);

        console.log('\n=== 7. SERVER PORT STATUS ===');
        const ports = await ssh.execCommand('netstat -tulnp');
        console.log(ports.stdout);

        ssh.dispose();
    } catch (error) {
        console.error('Audit Failed:', error);
    }
}

audit();
