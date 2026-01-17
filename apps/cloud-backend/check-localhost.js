const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };

(async () => {
    try {
        await ssh.connect(config);
        console.log('🔗 Curling Localhost HTTP...');
        const http = await ssh.execCommand('curl -v http://localhost');
        console.log(http.stdout);
        console.log(http.stderr);

        console.log('\n🔗 Curling Localhost HTTPS (-k)...');
        const https = await ssh.execCommand('curl -v -k https://localhost');
        console.log(https.stdout);
        console.log(https.stderr);

        ssh.dispose();
    } catch (e) { console.error(e); }
})();
