const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };
const REMOTE_DIR = '/root/nadpos-backend';

(async () => {
    try {
        console.log('🔗 Connecting to VPS...');
        await ssh.connect(config);

        // 1. Stop Nginx
        console.log('🛑 Stopping Nginx...');
        try {
            await ssh.execCommand('docker-compose stop nginx', { cwd: REMOTE_DIR });
            await ssh.execCommand('docker-compose rm -f nginx', { cwd: REMOTE_DIR });
        } catch (e) { }

        // 2. Clean stuck certbots
        console.log('🧹 Cleaning certbot containers...');
        try {
            await ssh.execCommand('docker rm -f $(docker ps -a -q -f ancestor=certbot/certbot)');
        } catch (e) { }

        // 3. Run Certbot
        console.log('🔐 Running Certbot (Non-Interactive)...');
        // Added --non-interactive
        const cmd = `docker run --rm -p 80:80 -v ${REMOTE_DIR}/certbot/conf:/etc/letsencrypt -v ${REMOTE_DIR}/certbot/www:/var/www/certbot certbot/certbot certonly --standalone --non-interactive -d nadpos.uz -d www.nadpos.uz --email admin@nadpos.uz --agree-tos --no-eff-email --force-renewal`;

        const cert = await ssh.execCommand(cmd);
        console.log(cert.stdout);
        console.log(cert.stderr);

        if (cert.stdout.includes('Congratulations') || cert.stderr.includes('Congratulations')) {
            console.log('✅ Certificate obtained!');

            // 4. Enable HTTPS
            await ssh.putFile('nginx/https.conf', `${REMOTE_DIR}/nginx/default.conf`);
            await ssh.putFile('docker-compose.yml', `${REMOTE_DIR}/docker-compose.yml`); // Ensure correct compose

            console.log('🚀 Starting Nginx...');
            const start = await ssh.execCommand('docker-compose up -d --force-recreate nginx', { cwd: REMOTE_DIR });
            console.log(start.stdout);

            console.log('✨ HTTPS is LIVE! Check https://nadpos.uz');
        } else {
            console.error('❌ Certbot failed. Giving up and restoring HTTP.');
            // Fallback
            await ssh.putFile('nginx/http.conf', `${REMOTE_DIR}/nginx/default.conf`);
            await ssh.execCommand('docker-compose up -d nginx', { cwd: REMOTE_DIR });
        }

        ssh.dispose();
    } catch (e) { console.error(e); ssh.dispose(); }
})();
