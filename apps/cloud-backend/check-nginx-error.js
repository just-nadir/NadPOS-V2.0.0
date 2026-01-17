const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };

(async () => {
    try {
        await ssh.connect(config);

        // Find Nginx container ID/Name
        const ps = await ssh.execCommand('docker ps --format "{{.Names}}"');
        const nginxContainer = ps.stdout.split('\n').find(n => n.includes('nginx'));

        if (nginxContainer) {
            console.log(`Targeting Nginx: ${nginxContainer}`);
            const logs = await ssh.execCommand(`docker logs --tail 20 ${nginxContainer}`);
            console.log(logs.stdout);
            console.log(logs.stderr);
        } else {
            console.log('Nginx container not found');
        }

        ssh.dispose();
    } catch (e) { console.error(e); }
})();
