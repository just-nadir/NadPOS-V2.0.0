const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };
const REMOTE_DIR = '/root/nadpos-backend';

(async () => {
    try {
        console.log('🔗 Connecting to VPS...');
        await ssh.connect(config);

        // 1. Stop Nginx to free port 80
        console.log('🛑 Stopping Nginx...');
        try {
            await ssh.execCommand('docker-compose stop nginx', { cwd: REMOTE_DIR });
            await ssh.execCommand('docker-compose rm -f nginx', { cwd: REMOTE_DIR });
        } catch (e) { }

        console.log('🧹 Cleaning up stuck Certbot containers...');
        try {
            await ssh.execCommand('docker rm -f $(docker ps -a -q -f ancestor=certbot/certbot)');
        } catch (e) { }

        // 2. Run Certbot Standalone
        console.log('🔐 Running Certbot Standalone...');
        // Map port 80:80 to container so Let's Encrypt can connect
        const cmd = `docker run --rm -p 80:80 -v ${REMOTE_DIR}/certbot/conf:/etc/letsencrypt -v ${REMOTE_DIR}/certbot/www:/var/www/certbot certbot/certbot certonly --standalone -d nadpos.uz -d www.nadpos.uz --email nodir@example.com --agree-tos --no-eff-email --force-renewal`;

        const cert = await ssh.execCommand(cmd);
        console.log(cert.stdout);
        console.log(cert.stderr);

        if (cert.stdout.includes('Congratulations') || cert.stderr.includes('Congratulations')) {
            console.log('✅ Certificate obtained!');

            // 3. Enable HTTPS and Start Nginx
            console.log('🔒 Enabling HTTPS config...');
            await ssh.putFile('nginx/https.conf', `${REMOTE_DIR}/nginx/default.conf`);

            console.log('🚀 Starting Nginx...');
            // We removed certbot service from local docker-compose.yml previously, so uploading it now is safe
            await ssh.putFile('docker-compose.yml', `${REMOTE_DIR}/docker-compose.yml`);

            const start = await ssh.execCommand('docker-compose up -d --force-recreate nginx', { cwd: REMOTE_DIR });
            console.log(start.stdout);
            console.log(start.stderr);

            console.log('✨ HTTPS is LIVE! Check https://nadpos.uz');
        } else {
            console.error('❌ Certbot failed.');
        }

        ssh.dispose();
    } catch (e) {
        console.error(e);
        ssh.dispose();
    }
})();
