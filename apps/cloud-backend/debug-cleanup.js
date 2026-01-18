const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function cleanupAndCheck() {
    try {
        await ssh.connect(config);

        console.log('--- 1. Remove Old JS File (index-sQV2Q87X.js) ---');
        // Remove from HOST first (mounted? no, copied during build. But we put files on host public)
        // Wait, deploy-admin-v2 put files to /root/nadpos-backend/public.
        // And docker build COPIED them.
        // So we should remove from Host AND Container?
        // Let's verify file names on Host again.

        // Find OLD file name by grep "nadpos.uz" again?
        // We know it is index-sQV2Q87X.js from previous step.

        const oldFile = 'index-sQV2Q87X.js';

        // Host
        await ssh.execCommand(`rm /root/nadpos-backend/public/assets/${oldFile}`);
        // Container
        await ssh.execCommand(`docker exec nadpos_backend rm /app/public/assets/${oldFile}`);

        console.log('Old file removed.');

        console.log('--- 2. Curl Localhost Index ---');
        const curl = await ssh.execCommand('curl -s http://localhost:80/');
        console.log(curl.stdout); // Should show new index.html with index-DhsdxFgy.js

        console.log('--- 3. Check MIME type of JS file ---');
        // We curl header of the JS file via Nginx -> App
        const newJs = 'index-DhsdxFgy.js';
        const jsCurl = await ssh.execCommand(`curl -I http://localhost:80/assets/${newJs}`);
        console.log(jsCurl.stdout || jsCurl.stderr);

        ssh.dispose();
    } catch (e) { console.error(e); }
}

cleanupAndCheck();
