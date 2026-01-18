const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function checkUrl() {
    try {
        await ssh.connect(config);

        console.log('--- Checking for nadpos.uz ---');
        // -r recursive, -l files with matches
        const res = await ssh.execCommand('grep -r -l "nadpos.uz" /root/nadpos-backend/public');
        console.log('Files with nadpos.uz:', res.stdout || 'None');

        console.log('--- Checking for /api ---');
        const res2 = await ssh.execCommand('grep -r -l "/api" /root/nadpos-backend/public');
        console.log('Files with /api:', res2.stdout || 'None');

        ssh.dispose();
    } catch (e) { console.error(e); }
}

checkUrl();
