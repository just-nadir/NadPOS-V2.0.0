const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function debugBackend() {
    try {
        await ssh.connect(config);

        console.log('--- 1. EXIT CODE ---');
        const exitCode = await ssh.execCommand('docker inspect nadpos_backend --format="{{.State.ExitCode}}"');
        console.log('Exit Code:', exitCode.stdout.trim());

        console.log('--- 2. EXIT ERROR ---');
        const error = await ssh.execCommand('docker inspect nadpos_backend --format="{{.State.Error}}"');
        console.log('Error:', error.stdout.trim());

        console.log('--- 3. FULL LOGS (Last 100) ---');
        const logs = await ssh.execCommand('docker logs --tail 100 nadpos_backend');
        console.log(logs.stdout || logs.stderr);

        ssh.dispose();
    } catch (error) {
        console.error('Debug Failed:', error);
    }
}

debugBackend();
