const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function checkContainerCode() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        console.log('--- Checking /app/src/services/authService.js INSIDE Container ---');
        const cmd = 'docker exec nadpos_backend cat src/services/authService.js';
        const result = await ssh.execCommand(cmd);

        if (result.stdout.includes('RS256')) {
            console.log('SUCCESS: Container has NEW code (RS256).');
        } else {
            console.error('FAILURE: Container has OLD code (No RS256 found)!');
            console.log('--- Triggering Rebuild NO CACHE ---');
            await ssh.execCommand('docker-compose down', { cwd: '/root/nadpos-backend' });
            await ssh.execCommand('docker-compose build --no-cache app', { cwd: '/root/nadpos-backend' });
            await ssh.execCommand('docker-compose up -d', { cwd: '/root/nadpos-backend' });
            console.log('Rebuild complete.');
        }

        ssh.dispose();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkContainerCode();
