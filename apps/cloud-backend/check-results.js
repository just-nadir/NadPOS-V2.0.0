const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };

(async () => {
    try {
        await ssh.connect(config);
        console.log('📂 Checking for certs...');
        const ls = await ssh.execCommand('ls -l /root/nadpos-backend/certbot/conf/live/nadpos.uz');
        console.log(ls.stdout);

        console.log('🐳 Checking Nginx...');
        const ps = await ssh.execCommand('docker-compose ps nginx', { cwd: '/root/nadpos-backend' });
        console.log(ps.stdout);

        ssh.dispose();
    } catch (e) { console.error(e); }
})();
