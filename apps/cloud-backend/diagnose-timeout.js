const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };

(async () => {
    try {
        console.log('🔗 Connecting to VPS...');
        await ssh.connect(config);
        console.log('✅ Connected!');

        console.log('\n📊 System Resource Usage:');
        const free = await ssh.execCommand('free -h');
        console.log(free.stdout);
        const uptime = await ssh.execCommand('uptime');
        console.log(uptime.stdout);

        console.log('\n🐳 Docker Containers:');
        const ps = await ssh.execCommand('docker ps -a');
        console.log(ps.stdout);

        console.log('\n🔥 Firewall (UFW) Status:');
        const ufw = await ssh.execCommand('ufw status');
        console.log(ufw.stdout); // Might be command not found or inactive, which is fine.

        console.log('\n🌐 Checking Ports (Netstat):');
        // Check if 80 and 443 are listening
        const netstat = await ssh.execCommand('netstat -tulpn | grep -E ":80|:443"');
        console.log(netstat.stdout);

        ssh.dispose();
    } catch (e) {
        console.error('❌ Failed to connect or execute:', e);
    }
})();
