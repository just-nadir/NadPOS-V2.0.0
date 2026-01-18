const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function fix() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        console.log('--- 1. Starting Docker Service ---');
        await ssh.execCommand('systemctl daemon-reload');
        const start = await ssh.execCommand('systemctl start docker');
        console.log('Start Result:', start.stdout || start.stderr);

        const enable = await ssh.execCommand('systemctl enable docker'); // Auto-start
        console.log('Enable Result:', enable.stdout || enable.stderr);

        console.log('--- 2. Checking Docker Status ---');
        const status = await ssh.execCommand('systemctl is-active docker');
        console.log('Docker Status:', status.stdout.trim());

        if (status.stdout.trim() !== 'active') {
            console.error('Docker Failed to Start. Trying installation repair...');
            // Attempt to reinstall/fix
            await ssh.execCommand('apt-get update && apt-get install -y docker.io');
            await ssh.execCommand('systemctl start docker');
        }

        console.log('--- 3. Running Containers ---');
        const up = await ssh.execCommand('cd /root/nadpos-backend && docker-compose up -d');
        console.log(up.stdout || up.stderr);

        console.log('--- 4. Checking Ports ---');
        const ports = await ssh.execCommand('netstat -tulnp | grep 4000');
        console.log('Port 4000:', ports.stdout || 'Not listening yet');

        ssh.dispose();
    } catch (error) {
        console.error('Fix Failed:', error);
    }
}

fix();
