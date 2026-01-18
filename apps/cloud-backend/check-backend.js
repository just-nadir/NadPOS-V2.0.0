const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function checkBackend() {
    try {
        await ssh.connect(config);

        console.log('--- 1. CONTAINER STATUS ---');
        const ps = await ssh.execCommand('docker ps -a --filter name=nadpos_backend');
        console.log(ps.stdout);

        console.log('--- 2. BACKEND LOGS (Last 50) ---');
        const logs = await ssh.execCommand('docker logs --tail 50 nadpos_backend');
        console.log(logs.stdout || logs.stderr);

        ssh.dispose();
    } catch (error) {
        console.error('Check Failed:', error);
    }
}

checkBackend();
