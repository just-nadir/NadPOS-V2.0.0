const { NodeSSH } = require('node-ssh');
const path = require('path');

const ssh = new NodeSSH();

// VPS Credentials
const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998', // Hardcoded for this specific run
    remoteDir: '/root/nadpos-backend'
};

async function deploy() {
    try {
        console.log(`Connecting to ${config.host}...`);
        await ssh.connect(config);
        console.log('Connected!');

        // 1. Create Remote Directory
        console.log(`Creating directory: ${config.remoteDir}`);
        await ssh.execCommand(`mkdir -p ${config.remoteDir}`);

        // 2. Upload Files
        const localDir = path.join(__dirname); // apps/cloud-backend
        const failed = [];
        const successful = [];

        console.log('Uploading files...');

        // Upload Directory Structure
        // We need to upload: src, prisma, public, Dockerfile, docker-compose.yml, package.json, setup.sh

        // Helper to upload directory
        await ssh.putDirectory(path.join(localDir, 'src'), path.join(config.remoteDir, 'src'), {
            recursive: true,
            tick: (localPath, remotePath, error) => {
                if (error) console.error(`Failed: ${localPath}`);
            }
        });
        console.log('Uploaded: src');

        await ssh.putDirectory(path.join(localDir, 'prisma'), path.join(config.remoteDir, 'prisma'), {
            recursive: true
        });
        console.log('Uploaded: prisma');

        // Check if public exists (it should have admin panel build)
        if (require('fs').existsSync(path.join(localDir, 'public'))) {
            await ssh.putDirectory(path.join(localDir, 'public'), path.join(config.remoteDir, 'public'), {
                recursive: true
            });
            console.log('Uploaded: public');
        }

        // Upload individual files
        const files = ['Dockerfile', 'docker-compose.yml', 'package.json', 'setup.sh', '.env'];
        for (const file of files) {
            const localFile = path.join(localDir, file);
            if (require('fs').existsSync(localFile)) {
                await ssh.putFile(localFile, path.join(config.remoteDir, file));
                console.log(`Uploaded: ${file}`);
            }
        }

        // Upload nginx folder if exists
        if (require('fs').existsSync(path.join(localDir, 'nginx'))) {
            await ssh.putDirectory(path.join(localDir, 'nginx'), path.join(config.remoteDir, 'nginx'));
            console.log('Uploaded: nginx');
        }

        // 3. Execute Setup Script
        console.log('Executing setup.sh...');
        const result = await ssh.execCommand(`cd ${config.remoteDir} && chmod +x setup.sh && ./setup.sh`);

        console.log('STDOUT:', result.stdout);
        console.log('STDERR:', result.stderr);

        console.log('Deployment Completed!');
        ssh.dispose();

    } catch (error) {
        console.error('Deployment Failed:', error);
        ssh.dispose();
        process.exit(1);
    }
}

deploy();
