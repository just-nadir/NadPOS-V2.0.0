const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function debugWhiteScreen() {
    try {
        await ssh.connect(config);

        console.log('--- 1. Check Index HTML in Container ---');
        // Get the JS filename from index.html inside container
        const indexHtml = await ssh.execCommand('docker exec nadpos_backend cat /app/public/index.html');
        console.log(indexHtml.stdout);

        // Extract src="..."
        const match = indexHtml.stdout.match(/src="\/assets\/([^"]+)"/);
        if (match) {
            const jsFile = match[1];
            console.log(`Target JS File: ${jsFile}`);

            console.log('--- 2. Check if JS file exists in Container ---');
            const checkLs = await ssh.execCommand(`docker exec nadpos_backend ls -l /app/public/assets/${jsFile}`);
            console.log(checkLs.stdout || checkLs.stderr);
        } else {
            console.log('Could not find script src in index.html');
        }

        console.log('--- 3. Verify Public Folder Content ---');
        const lsPublic = await ssh.execCommand('docker exec nadpos_backend ls -R /app/public');
        console.log(lsPublic.stdout);

        console.log('--- 4. Check Backend Logs (Last 50 lines) ---');
        const logs = await ssh.execCommand('docker logs --tail 50 nadpos_backend');
        console.log(logs.stdout || logs.stderr);

        ssh.dispose();
    } catch (e) { console.error(e); }
}

debugWhiteScreen();
