const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };

(async () => {
    try {
        await ssh.connect(config);
        console.log('📂 Checking Assets on VPS...');
        const ls = await ssh.execCommand('ls -l /root/nadpos-backend/public/assets');
        console.log(ls.stdout);
        ssh.dispose();
    } catch (e) { console.error(e); }
})();
