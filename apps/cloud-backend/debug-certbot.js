const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998',
};

(async () => {
    try {
        await ssh.connect(config);
        const { stdout } = await ssh.execCommand('docker-compose logs certbot', { cwd: '/root/nadpos-backend' });
        console.log(stdout);
        ssh.dispose();
    } catch (e) {
        console.error(e);
    }
})();
