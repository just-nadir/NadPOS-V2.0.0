const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function deployAdminV2() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        const localDist = path.join(__dirname, '../admin-panel/dist');
        const remotePublic = '/root/nadpos-backend/public';

        console.log(`Uploading ${localDist} to ${remotePublic}...`);

        await ssh.putDirectory(localDist, remotePublic, {
            recursive: true,
            concurrency: 10,
            validate: (itemPath) => {
                const baseName = path.basename(itemPath);
                return baseName.substring(0, 1) !== '.' && baseName !== 'node_modules'
            }
        });

        console.log('Upload complete.');

        // CRITICAL STEP: Rebuild App Container to copy new public files
        console.log('--- Rebuilding Backend Container ---');
        // We use --no-cache to force COPY of new files
        const cmd = `cd /root/nadpos-backend && docker-compose build --no-cache app && docker-compose up -d app`;
        console.log(`Running: ${cmd}`);

        await ssh.execCommand(cmd);

        // Wait
        console.log('Waiting for startup (20s)...');
        await new Promise(r => setTimeout(r, 20000));

        ssh.dispose();
    } catch (error) {
        console.error('Deploy V2 Failed:', error);
    }
}

deployAdminV2();
