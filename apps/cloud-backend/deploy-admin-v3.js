const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');
const { execSync } = require('child_process');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function deployAdmin() {
    try {
        console.log('--- 1. Building Admin Panel ---');
        execSync('npm run build', { cwd: path.join(__dirname, '../admin-panel'), stdio: 'inherit' });

        console.log('--- 2. Connecting to VPS ---');
        await ssh.connect(config);

        console.log('--- 3. Create Public Dir if not exists ---');
        await ssh.execCommand('mkdir -p /root/nadpos-backend/public');

        console.log('--- 4. Uploading Build Files ---');
        // Upload dist contents to remote public folder
        const localDir = path.join(__dirname, '../admin-panel/dist');
        const remoteDir = '/root/nadpos-backend/public';

        await ssh.putDirectory(localDir, remoteDir, {
            recursive: true,
            concurrency: 10,
            tick: (localPath, remotePath, error) => {
                if (error) console.error(`Failed: ${localPath}`);
                // else console.log(`Uploaded: ${localPath}`);
            }
        });

        console.log('--- 5. Restarting Backend (to serve new files) ---');
        await ssh.execCommand('docker-compose restart app', { cwd: '/root/nadpos-backend' });

        console.log('✅ Admin Panel Deployed Successfully!');
        ssh.dispose();

    } catch (e) {
        console.error(e);
    }
}

deployAdmin();
