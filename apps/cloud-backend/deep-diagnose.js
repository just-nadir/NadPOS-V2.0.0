const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function diagnose() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        console.log('\n=== 1. DOCKER CONTAINERS ===');
        const containers = await ssh.execCommand('docker ps -a');
        console.log(containers.stdout || containers.stderr);

        console.log('\n=== 2. BACKEND LOGS (Last 50 lines) ===');
        const logs = await ssh.execCommand('docker logs --tail 50 nadpos_backend');
        console.log(logs.stdout || logs.stderr);

        console.log('\n=== 3. PORT LISTENING CHECK ===');
        // netstat might not be installed, try ss or lsof too if needed, or docker port
        const ports = await ssh.execCommand('netstat -tulnp | grep 4000');
        console.log(ports.stdout || 'Port 4000 not found in netstat');

        console.log('\n=== 4. FIREWALL STATUS (UFW) ===');
        const ufw = await ssh.execCommand('ufw status');
        console.log(ufw.stdout || ufw.stderr);

        ssh.dispose();
    } catch (error) {
        console.error('Diagnosis Failed:', error);
    }
}

diagnose();
