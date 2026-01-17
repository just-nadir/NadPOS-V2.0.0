const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };

(async () => {
    try {
        await ssh.connect(config);
        const { stdout, stderr } = await ssh.execCommand('docker-compose logs nginx', { cwd: '/root/nadpos-backend' });
        console.log('STDOUT:', stdout);
        console.log('STDERR:', stderr);
        ssh.dispose();
    } catch (e) { console.error(e); }
})();
