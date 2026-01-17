const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };

(async () => {
    try {
        await ssh.connect(config);
        console.log('🔄 Restarting backend...');
        await ssh.execCommand('docker start 55f9ec330af1'); // Restart keyinroq, hozircha start qilamiz
        // Yoki docker-compose restart app
        await ssh.execCommand('docker-compose restart app', { cwd: '/root/nadpos-backend' });

        console.log('✅ Restarted. Checking resources...');
        await new Promise(r => setTimeout(r, 3000));

        const ps = await ssh.execCommand('docker ps');
        console.log(ps.stdout);

        const stats = await ssh.execCommand('docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}"');
        console.log(stats.stdout);

        ssh.dispose();
    } catch (e) { console.error(e); ssh.dispose(); }
})();
