const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function verifyBackend() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        console.log('--- 1. Check authService.js (Host) ---');
        const fileContent = await ssh.execCommand('cat /root/nadpos-backend/src/services/authService.js');
        // Check for "RS256" string
        if (fileContent.stdout.includes('RS256')) {
            console.log('SUCCESS: Host file contains RS256 code.');
        } else {
            console.error('FAILURE: Host file does NOT contain RS256 code. It is OLD!');
            console.log(fileContent.stdout.substring(0, 500)); // Show preview
        }

        console.log('--- 2. Check Container Logs (Post-Restart) ---');
        const logs = await ssh.execCommand('docker logs --tail 20 nadpos_backend');
        console.log(logs.stdout || logs.stderr);

        ssh.dispose();
    } catch (error) {
        console.error('Error:', error);
    }
}

verifyBackend();
