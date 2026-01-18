const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function verifyFrontend() {
    try {
        await ssh.connect(config);

        console.log('--- 1. Grep on Host (public) ---');
        const hostGrep = await ssh.execCommand('grep -r "nadpos.uz" /root/nadpos-backend/public');
        if (hostGrep.stdout) console.log('FAIL: Found in Host:', hostGrep.stdout);
        else console.log('PASS: Not found in Host');

        console.log('--- 2. Grep inside Container (/app/public) ---');
        // Container might not have grep depending on base image (debian slim has grep? usually yes)
        const containerGrep = await ssh.execCommand('docker exec nadpos_backend grep -r "nadpos.uz" /app/public');

        // If grep returns 1 (not found), node-ssh might put it in stderr or just empty stdout causing exit code 1
        // We need to check exit code? grep returns 1 if not found.

        console.log('Output:', containerGrep.stdout || containerGrep.stderr);

        console.log('--- 3. Check for correct URL (/api) ---');
        // Search for the relative url string that replaced it.
        // It was "const API_URL = '/api';" => compiled to something like "baseURL:'/api'"
        const checkCorrect = await ssh.execCommand('grep -r "/api" /root/nadpos-backend/public | wc -l');
        console.log('Matches for /api:', checkCorrect.stdout);

        ssh.dispose();
    } catch (e) { console.error(e); }
}

verifyFrontend();
