const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };

(async () => {
    try {
        await ssh.connect(config);
        console.log('🔗 Curling https://nadpos.uz...');
        const curl = await ssh.execCommand('curl -I https://nadpos.uz');
        console.log(curl.stdout);
        console.log(curl.stderr);
        ssh.dispose();
    } catch (e) { console.error(e); }
})();
