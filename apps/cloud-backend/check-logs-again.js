const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };

(async () => {
    try {
        await ssh.connect(config);

        console.log('📜 Backend Logs (Latest):');
        // Get logs of the container name 'nadpos_backend' (if that is the name) or use filters
        // Based on previous output, container name might be 'nadpos_backend' but sometimes compose prefixes it.
        // Let's use the exact name from docker ps
        const ps = await ssh.execCommand('docker ps --format "{{.Names}}"');
        const containerName = ps.stdout.split('\n').find(n => n.includes('nadpos_backend') || n.includes('app'));

        if (containerName) {
            console.log(`Targeting container: ${containerName}`);
            const logs = await ssh.execCommand(`docker logs --tail 100 ${containerName}`);
            console.log(logs.stdout);
            console.log(logs.stderr);

            // Curl internal
            console.log('\n🔗 Curling Backend Internal:');
            // We curl the container's IP directly or checking port 4000 on host if exposed
            const curl = await ssh.execCommand('curl -v http://localhost:4000');
            console.log(curl.stdout);
            console.log(curl.stderr);
        } else {
            console.error('❌ Backend container not found!');
        }

        ssh.dispose();
    } catch (e) { console.error(e); }
})();
