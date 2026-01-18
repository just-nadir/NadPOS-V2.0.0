const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function check() {
    try {
        await ssh.connect(config);
        const cat = await ssh.execCommand('cat /root/nadpos-backend/Dockerfile');
        console.log('Dockerfile Content:\n', cat.stdout);
        ssh.dispose();
    } catch (e) {
        console.error(e);
    }
}

check();
