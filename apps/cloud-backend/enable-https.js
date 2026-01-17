const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const ssh = new NodeSSH();

// VPS Config
const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998',
};

const REMOTE_DIR = '/root/nadpos-backend';

(async () => {
    try {
        console.log('🔗 Connecting to VPS...');
        await ssh.connect(config);
        console.log('✅ Connected!');

        // 1. Setup Directories
        console.log('📂 Preparing file structure...');
        await ssh.execCommand('mkdir -p nginx certbot/conf certbot/www', { cwd: REMOTE_DIR });

        // 2. Step 1: Upload Configs (Initial HTTP Only)
        console.log('📤 Uploading configs...');
        await ssh.putFile('docker-compose.yml', `${REMOTE_DIR}/docker-compose.yml`);

        // Use HTTP config first to pass challenge
        await ssh.putFile('nginx/http.conf', `${REMOTE_DIR}/nginx/default.conf`);

        // 3. Restart Nginx to apply HTTP config & New Volumes
        console.log('🔄 Restarting Nginx (HTTP Mode)...');
        await ssh.execCommand('docker-compose up -d --force-recreate nginx certbot', { cwd: REMOTE_DIR });

        // Wait for Nginx
        await new Promise(r => setTimeout(r, 5000));

        // 4. Run Certbot
        console.log('🔐 Requesting SSL Certificate...');
        // docker-compose run certbot certonly ...
        // Using --rm to remove container after run
        const certCmd = 'docker-compose run --rm certbot certonly --webroot --webroot-path /var/www/certbot -d nadpos.uz -d www.nadpos.uz --email nodir@example.com --agree-tos --no-eff-email --force-renewal';

        const certResult = await ssh.execCommand(certCmd, { cwd: REMOTE_DIR });
        console.log(certResult.stdout);
        console.log(certResult.stderr);

        if (certResult.stderr.includes('Congratulations') || certResult.stdout.includes('Congratulations')) {
            console.log('✅ Certificate obtained successfully!');

            // 5. Step 2: Switch to HTTPS Config
            console.log('🔒 Enabling HTTPS...');
            await ssh.putFile('nginx/https.conf', `${REMOTE_DIR}/nginx/default.conf`);

            console.log('🔄 Reloading Nginx (HTTPS Mode)...');
            await ssh.execCommand('docker-compose exec -T nginx nginx -s reload', { cwd: REMOTE_DIR });

            console.log('✨ HTTPS Enabled! Check https://nadpos.uz');

        } else {
            console.error('❌ Certbot failed. Check logs above.');
        }

        ssh.dispose();

    } catch (error) {
        console.error('❌ Error:', error);
        ssh.dispose();
    }
})();
