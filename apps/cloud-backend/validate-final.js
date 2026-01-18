const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function validate() {
    try {
        await ssh.connect(config);

        console.log('--- 1. Root Request (Frontend) ---');
        const root = await ssh.execCommand('curl -L -v http://localhost:80');
        console.log('Status:', root.stdout.includes('200 OK') ? 'OK' : 'FAIL');
        console.log('Content:', root.stdout.substring(0, 200)); // Show beginning of HTML

        console.log('--- 2. API Request ---');
        const api = await ssh.execCommand('curl -v -X POST http://localhost:80/api/auth/login');
        // Expecting 400 or 401 (since no body), but connectivity implies success
        console.log('API Response:', api.stdout || api.stderr);

        ssh.dispose();
    } catch (e) { console.error(e); }
}

validate();
