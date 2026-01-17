const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

// VPS Config
const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998',
};

(async () => {
    try {
        console.log('🔗 Connecting to VPS...');
        await ssh.connect(config);
        console.log('✅ Connected!');

        // 1. Check Running Containers
        console.log('\n🐳 Checking Running Containers...');
        const { stdout: runningContainers } = await ssh.execCommand('docker ps --format "{{.Names}}"');
        const activeApps = runningContainers.split('\n').filter(Boolean);
        console.log('Active Apps:', activeApps);

        if (activeApps.length === 0) {
            console.warn('⚠️ No active containers found! Be careful, full cleanup might wipe everything.');
        }

        // 2. Docker Prune (Clean everything unused)
        console.log('\n🧹 Running Docker Prune (Images, Containers, Volumes, Networks)...');
        // -a: all unused images not just dangling
        // -f: force
        // --volumes: prune volumes too
        await ssh.execCommand('docker system prune -a -f --volumes');
        console.log('✅ Docker Cleaned.');

        // 3. File System Check
        console.log('\n📂 Checking /root directory...');
        const { stdout: files } = await ssh.execCommand('ls -1 /root');
        const fileList = files.split('\n').filter(Boolean);

        const KEEP_FILES = ['nadpos-backend', 'snap', '.ssh', '.bashrc', '.profile', '.cache', '.config', '.local', '.npm', '.wget-hsts', '.lesshst'];

        for (const file of fileList) {
            if (!KEEP_FILES.includes(file)) {
                console.log(`🗑️ Deleting unrelated file/folder: ${file}`);
                await ssh.execCommand(`rm -rf /root/${file}`);
            } else {
                console.log(`🛡️ Keeping: ${file}`);
            }
        }

        console.log('\n✨ Analysis & Cleanup Complete!');

        // Final Status
        const ps = await ssh.execCommand('docker ps');
        console.log('\nFinal Docker Status:\n' + ps.stdout);

        const ls = await ssh.execCommand('ls -la /root');
        console.log('\nFinal Files:\n' + ls.stdout);

        ssh.dispose();

    } catch (error) {
        console.error('❌ Error:', error);
        ssh.dispose();
    }
})();
