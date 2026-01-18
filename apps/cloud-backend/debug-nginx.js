const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function debugNginx() {
    try {
        await ssh.connect(config);

        console.log('--- Nginx Logs ---');
        const logs = await ssh.execCommand('docker logs --tail 50 nadpos_nginx');
        console.log(logs.stdout || logs.stderr);

        console.log('--- Nginx Config Test ---');
        const test = await ssh.execCommand('docker exec nadpos_nginx nginx -t');
        console.log(test.stdout || test.stderr);

        console.log('--- Check Nginx Dir ---');
        const ls = await ssh.execCommand('ls -l /root/nadpos-backend/nginx/');
        console.log(ls.stdout);

        ssh.dispose();
    } catch (error) {
        console.error('Debug Failed:', error);
    }
}

debugNginx();
