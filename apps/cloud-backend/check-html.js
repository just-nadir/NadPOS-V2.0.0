const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };

(async () => {
    try {
        await ssh.connect(config);
        console.log('📄 Reading index.html...');
        const html = await ssh.execCommand('cat /root/nadpos-backend/public/index.html');
        console.log(html.stdout);
        ssh.dispose();
    } catch (e) { console.error(e); }
})();
