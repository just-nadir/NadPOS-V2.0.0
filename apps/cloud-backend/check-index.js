const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function checkIndex() {
    try {
        await ssh.connect(config);
        const res = await ssh.execCommand('cat /root/nadpos-backend/public/index.html');
        console.log(res.stdout);
        ssh.dispose();
    } catch (e) { console.error(e); }
}

checkIndex();
