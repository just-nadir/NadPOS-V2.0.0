const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function debug() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        console.log('--- 1. FULL LOGS ---');
        const logs = await ssh.execCommand('docker logs --tail 200 nadpos_backend');
        console.log(logs.stdout || logs.stderr);

        console.log('--- 2. HOST FILE STRUCTURE ---');
        const ls = await ssh.execCommand('ls -R /root/nadpos-backend');
        console.log(ls.stdout);

        console.log('--- 3. PACKAGE.JSON content ---');
        const pkg = await ssh.execCommand('cat /root/nadpos-backend/package.json');
        console.log(pkg.stdout);

        ssh.dispose();
    } catch (error) {
        console.error('Debug Failed:', error);
    }
}

debug();
