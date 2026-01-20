const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function explore() {
    try {
        await ssh.connect(config);
        console.log('--- Checking Nginx Config ---');
        // Try to read nginx config to see where root points
        try {
            const nginxConf = await ssh.execCommand('cat /etc/nginx/sites-enabled/default');
            console.log(nginxConf.stdout);
        } catch (e) { console.log('Cannot read nginx conf'); }

        console.log('--- Checking /var/www ---');
        const varWww = await ssh.execCommand('ls -la /var/www');
        console.log(varWww.stdout);

        console.log('--- Checking /root ---');
        const rootDir = await ssh.execCommand('ls -la /root');
        console.log(rootDir.stdout);

        ssh.dispose();
    } catch (e) {
        console.error(e);
    }
}

explore();
