const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };

(async () => {
    try {
        await ssh.connect(config);
        console.log('📂 Listing Directory:');
        const ls = await ssh.execCommand('ls -l /root/nadpos-backend');
        console.log(ls.stdout);

        console.log('\n🐳 Docker All Containers:');
        const ps = await ssh.execCommand('docker ps -a');
        console.log(ps.stdout);

        console.log('\n🛑 Inspecting Exit Code (if any):');
        // Check logs of the last exited container if any
        const logs = await ssh.execCommand('docker logs $(docker ps -a -q -l)');
        console.log(logs.stdout);
        console.log(logs.stderr);

        console.log('\n🛠 Trying Up Verbose:');
        const up = await ssh.execCommand('docker-compose up -d', { cwd: '/root/nadpos-backend' });
        console.log(up.stdout);
        console.log(up.stderr);

        ssh.dispose();
    } catch (e) { console.error(e); ssh.dispose(); }
})();
