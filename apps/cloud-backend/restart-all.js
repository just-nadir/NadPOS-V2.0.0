const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };

(async () => {
    try {
        await ssh.connect(config);
        console.log('🔄 Restarting ALL containers...');

        await ssh.execCommand('docker-compose down', { cwd: '/root/nadpos-backend' });
        await ssh.execCommand('docker-compose up -d', { cwd: '/root/nadpos-backend' });

        console.log('✅ Restarted. Checking status...');
        await new Promise(r => setTimeout(r, 5000));

        const ps = await ssh.execCommand('docker ps');
        console.log(ps.stdout);

        console.log('\n🔗 Connection Check:');
        const check = await ssh.execCommand('curl -I https://nadpos.uz');
        console.log(check.stdout);
        console.log(check.stderr);

        ssh.dispose();
    } catch (e) { console.error(e); ssh.dispose(); }
})();
