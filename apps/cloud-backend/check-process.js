const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };

(async () => {
    try {
        await ssh.connect(config);
        console.log('🐳 Docker PS:');
        const ps = await ssh.execCommand('docker ps');
        console.log(ps.stdout);
        ssh.dispose();
    } catch (e) { console.error(e); }
})();
