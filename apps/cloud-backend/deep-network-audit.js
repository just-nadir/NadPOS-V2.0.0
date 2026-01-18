const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function auditNetwork() {
    try {
        await ssh.connect(config);

        console.log('--- 1. Docker Process Status ---');
        const ps = await ssh.execCommand('docker ps');
        console.log(ps.stdout || ps.stderr);

        console.log('--- 2. Host Ports ---');
        // Try ss if netstat fails/missing features
        const ss = await ssh.execCommand('ss -tulpn');
        console.log(ss.stdout || ss.stderr);

        console.log('--- 3. Internal Connectivity (Nginx -> App) ---');
        // Check if curl exists in alpine nginx
        const internal = await ssh.execCommand('docker exec nadpos_nginx curl -I http://app:4000');
        console.log(internal.stdout || internal.stderr);

        console.log('--- 4. Backend Container Logs (Last 20) ---');
        const logs = await ssh.execCommand('docker logs --tail 20 nadpos_backend');
        console.log(logs.stdout || logs.stderr);

        ssh.dispose();
    } catch (error) {
        console.error('Audit Failed:', error);
    }
}

auditNetwork();
