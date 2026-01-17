const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };
const REMOTE_DIR = '/root/nadpos-backend';

(async () => {
    try {
        console.log('🔗 Connecting to VPS...');
        await ssh.connect(config);

        // 1. Update docker-compose and Ensure HTTP Config
        console.log('📄 Updating config files...');
        await ssh.putFile('docker-compose.yml', `${REMOTE_DIR}/docker-compose.yml`);
        await ssh.putFile('nginx/http.conf', `${REMOTE_DIR}/nginx/default.conf`);

        // 2. Restart Nginx (Ensure it's running)
        console.log('🔄 Restarting Nginx...');
        try {
            await ssh.execCommand('docker-compose stop nginx', { cwd: REMOTE_DIR });
            await ssh.execCommand('docker-compose rm -f nginx', { cwd: REMOTE_DIR });
        } catch (e) { }

        await ssh.execCommand('docker-compose up -d --remove-orphans nginx', { cwd: REMOTE_DIR });

        // Check if running
        await new Promise(r => setTimeout(r, 3000));
        const ps = await ssh.execCommand('docker-compose ps nginx', { cwd: REMOTE_DIR });
        if (!ps.stdout.includes('Up')) {
            console.error('❌ Nginx failed to start. Aborting.');
            console.log(ps.stdout);
            process.exit(1);
        }

        // 3. Run Certbot (Docker Run)
        console.log('🔐 running Certbot...');
        const cmd = `docker run --rm -v ${REMOTE_DIR}/certbot/conf:/etc/letsencrypt -v ${REMOTE_DIR}/certbot/www:/var/www/certbot certbot/certbot certonly --webroot --webroot-path /var/www/certbot -d nadpos.uz -d www.nadpos.uz --email nodir@example.com --agree-tos --no-eff-email --force-renewal`;

        const cert = await ssh.execCommand(cmd);
        console.log(cert.stdout);
        console.log(cert.stderr);

        if (cert.stdout.includes('Congratulations') || cert.stderr.includes('Congratulations')) {
            console.log('✅ Certificate obtained!');

            // 4. Enable HTTPS
            console.log('🔒 Enabling HTTPS config...');
            await ssh.putFile('nginx/https.conf', `${REMOTE_DIR}/nginx/default.conf`);
            await ssh.execCommand('docker-compose exec -T nginx nginx -s reload', { cwd: REMOTE_DIR });
            console.log('✨ HTTPS is LIVE!');
        } else {
            console.error('❌ Certbot failed.');
        }

        ssh.dispose();
    } catch (e) {
        console.error(e);
        ssh.dispose();
    }
})();
