const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function checkLogs() {
    try {
        await ssh.connect(config);
        console.log('--- Database Logs (Last 50 lines) ---');
        // const logs = await ssh.execCommand('docker logs --tail 50 nadpos_backend');
        // container name is 'nadpos_backend' in docker-compose, but let's check ps
        const ps = await ssh.execCommand('docker ps');
        console.log(ps.stdout);

        const logs = await ssh.execCommand('docker logs --tail 50 nadpos_backend');
        console.log('--- BACKEND LOGS ---');
        console.log(logs.stdout);
        console.log(logs.stderr);

        console.log('--- Checking PEM files ---');
        const pemFiles = await ssh.execCommand('ls -la /root/nadpos-backend/*.pem');
        console.log(pemFiles.stdout);
        console.log(pemFiles.stderr);

        ssh.dispose();
    } catch (e) {
        console.error(e);
    }
}

checkLogs();
