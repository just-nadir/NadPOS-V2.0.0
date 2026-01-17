const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };

(async () => {
    try {
        await ssh.connect(config);
        console.log('🔗 Connected to VPS.');

        // 1. Check/Add Swap
        console.log('💾 Checking Swap...');
        const free = await ssh.execCommand('free -h');
        console.log(free.stdout);

        if (!free.stdout.includes('Swap:') || free.stdout.includes('Swap:            0B')) {
            console.log('⚠️ No Swap detected. Creating 4GB Swap...');
            await ssh.execCommand('fallocate -l 4G /swapfile');
            await ssh.execCommand('chmod 600 /swapfile');
            await ssh.execCommand('mkswap /swapfile');
            await ssh.execCommand('swapon /swapfile');
            await ssh.execCommand('echo "/swapfile none swap sw 0 0" >> /etc/fstab');
            console.log('✅ Swap created.');
        } else {
            console.log('✅ Swap already exists.');
        }

        // 2. Restart Docker
        console.log('🔄 Restarting Containers...');
        const cwd = '/root/nadpos-backend';

        // Restart only app
        await ssh.execCommand('docker-compose restart app', { cwd });

        // Wait and Check
        await new Promise(r => setTimeout(r, 5000));

        const ps = await ssh.execCommand('docker ps');
        console.log(ps.stdout);

        ssh.dispose();
    } catch (e) {
        console.error(e);
        ssh.dispose();
    }
})();
