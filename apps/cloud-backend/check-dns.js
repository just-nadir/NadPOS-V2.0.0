const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function checkDns() {
    try {
        await ssh.connect(config);

        console.log('--- Checking DNS for nadpos.uz ---');
        // Install dnsutils if needed, or just use ping/host
        // Debian slim might not have ping.
        // Let's try 'getent hosts nadpos.uz'
        const res = await ssh.execCommand('getent hosts nadpos.uz');
        console.log('Result:', res.stdout || res.stderr);

        if (res.stdout.includes('213.142.148.35')) {
            console.log('SUCCESS: Domain points to this server.');
        } else {
            console.log('WARNING: Domain does NOT point to this server yet.');
        }

        ssh.dispose();
    } catch (e) { console.error(e); }
}

checkDns();
