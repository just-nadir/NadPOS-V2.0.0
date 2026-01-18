const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function checkNginx() {
    try {
        await ssh.connect(config);

        console.log('--- 1. FILE LIST (nginx dir) ---');
        const ls = await ssh.execCommand('ls -l /root/nadpos-backend/nginx/');
        console.log(ls.stdout); // Should only contain default.conf

        console.log('--- 2. NGINX LOGS (Last 50) ---');
        const logs = await ssh.execCommand('docker logs --tail 50 nadpos_nginx');
        console.log(logs.stdout || logs.stderr);

        console.log('--- 3. CONTAINER STATUS ---');
        const ps = await ssh.execCommand('docker ps -a --filter name=nadpos_nginx');
        console.log(ps.stdout);

        ssh.dispose();
    } catch (error) {
        console.error('Check Failed:', error);
    }
}

checkNginx();
