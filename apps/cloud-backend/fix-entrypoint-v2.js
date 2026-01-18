const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function fixV2() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        console.log('--- Rebuilding Service: app ---');
        // Correct service name is 'app'
        const cmd = `cd /root/nadpos-backend && docker-compose up -d --build app`;

        console.log(`Running: ${cmd}`);
        const result = await ssh.execCommand(cmd);
        console.log(result.stdout || result.stderr);

        // Wait for startup
        console.log('Waiting for startup (10s)...');
        await new Promise(r => setTimeout(r, 10000));

        console.log('--- Checking Logs ---');
        const logs = await ssh.execCommand('docker logs --tail 50 nadpos_backend');
        console.log(logs.stdout || logs.stderr);

        console.log('--- Checking Port ---');
        const port = await ssh.execCommand('netstat -tulnp | grep 4000');
        console.log('Internal Port Check:', port.stdout);

        ssh.dispose();
    } catch (error) {
        console.error('Fix V2 Failed:', error);
    }
}

fixV2();
