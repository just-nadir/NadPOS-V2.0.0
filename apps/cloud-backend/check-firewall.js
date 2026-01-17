const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };

(async () => {
    try {
        await ssh.connect(config);
        console.log('🛡 Checking Iptables...');
        const iptables = await ssh.execCommand('iptables -L -n -v');
        console.log(iptables.stdout);
        ssh.dispose();
    } catch (e) { console.error(e); }
})();
