const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998',
};

(async () => {
    try {
        await ssh.connect(config);
        console.log('✅ Connected!');

        // 1. Check DNS (ping)
        console.log('📡 Checking DNS...');
        try {
            const ping = await ssh.execCommand('ping -c 1 nadpos.uz');
            console.log(ping.stdout);
        } catch (e) { console.log('Ping failed'); }

        // 2. Check Nginx Container
        console.log('🐳 Checking Nginx Container...');
        const ps = await ssh.execCommand('docker-compose ps nginx', { cwd: '/root/nadpos-backend' });
        console.log(ps.stdout);

        // 3. Create Dummy Challenge File
        console.log('📝 Creating dummy challenge file...');
        await ssh.execCommand('mkdir -p /root/nadpos-backend/certbot/www/.well-known/acme-challenge');
        await ssh.execCommand('echo "success" > /root/nadpos-backend/certbot/www/.well-known/acme-challenge/test.txt');

        // 4. Curl Self
        console.log('🔗 Curling dummy file...');
        const curl = await ssh.execCommand('curl -v http://nadpos.uz/.well-known/acme-challenge/test.txt');
        console.log(curl.stdout);
        console.log(curl.stderr); // Verbose output

        ssh.dispose();
    } catch (e) {
        console.error(e);
        ssh.dispose();
    }
})();
