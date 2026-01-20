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
        console.log('--- 1. Building Admin Panel (Base: /admin/) ---');
        // Ensure dependencies installed
        // execSync('npm install', { cwd: path.join(__dirname, '../admin-panel'), stdio: 'inherit' });
        execSync('npm run build', { cwd: path.join(__dirname, '../admin-panel'), stdio: 'inherit' });

        console.log('--- 2. Connecting to VPS ---');
        await ssh.connect(config);

        console.log('--- 3. Clean Old Files ---');
        // Remove contents of public, but keep the folder
        await ssh.execCommand('rm -rf /root/nadpos-backend/public/*');
        // Ensure folder exists
        await ssh.execCommand('mkdir -p /root/nadpos-backend/public');

        console.log('--- 4. Uploading New Build ---');
        const localDir = path.join(__dirname, '../admin-panel/dist');
        const remoteDir = '/root/nadpos-backend/public';

        await ssh.putDirectory(localDir, remoteDir, {
            recursive: true,
            concurrency: 10,
            tick: (localPath, remotePath, error) => {
                if (error) console.error(`Failed: ${localPath}`);
            }
        });

        console.log('--- 5. Update Server Code (Upload entire src) ---');
        await ssh.putDirectory(
            path.join(__dirname, 'src'),
            '/root/nadpos-backend/src',
            {
                recursive: true,
                concurrency: 10,
                validate: (itemPath) => {
                    const baseName = path.basename(itemPath);
                    return baseName !== 'node_modules' && baseName !== '.env';
                }
            }
        );

        console.log('--- 6. Rebuilding & Restarting Backend ---');
        // Since we changed server.js and it's not mounted in docker-compose, we MUST rebuild
        await ssh.execCommand('docker-compose up -d --build app', { cwd: '/root/nadpos-backend' });

        console.log('✅ Admin Panel Deployed to nadpos.uz/admin!');
        ssh.dispose();

    } catch (e) {
        console.error('Deployment Failed:', e);
        process.exit(1);
    }
}

deployAdmin();
