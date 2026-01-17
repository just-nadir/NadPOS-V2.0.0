const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };

(async () => {
    try {
        await ssh.connect(config);
        console.log('🐳 Docker PS:');
        const ps = await ssh.execCommand('docker ps -a');
        console.log(ps.stdout);

        console.log('\n📜 Backend Logs (Tail 50):');
        const logs = await ssh.execCommand('docker logs --tail 50 nadpos_backend');
        console.log(logs.stdout);
        console.log(logs.stderr);

        console.log('\n📜 Nginx Logs (Tail 20):');
        const nginxLogs = await ssh.execCommand('docker logs --tail 20 nadpos_nginx');
        console.log(nginxLogs.stdout);
        console.log(nginxLogs.stderr);

        ssh.dispose();
    } catch (e) { console.error(e); }
})();
