const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

/*
 STEPS:
 1. Upload new Nginx Conf (with /.well-known support)
 2. Reload Nginx
 3. Install Certbot on Host
 4. Run Certbot (Webroot mode)
*/

async function setupSslPhase1() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        // 1. Upload Nginx Conf
        console.log('Uploading Nginx Config...');
        const localConf = path.join(__dirname, 'nginx/default.conf');
        await ssh.putFile(localConf, '/root/nadpos-backend/nginx/default.conf');

        // 2. Reload Nginx
        console.log('Reloading Nginx...');
        await ssh.execCommand('docker exec nadpos_nginx nginx -s reload');

        // 3. Install Certbot
        console.log('--- Installing Certbot on Host ---');
        // Debian/Ubuntu way
        await ssh.execCommand('apt-get update');
        const install = await ssh.execCommand('apt-get install -y certbot');
        console.log(install.stdout || install.stderr);

        // 4. Create webroot directory if not exists
        await ssh.execCommand('mkdir -p /root/nadpos-backend/certbot/www');
        await ssh.execCommand('mkdir -p /root/nadpos-backend/certbot/conf');

        // 5. Run Certbot
        const domains = '-d nadpos.uz -d www.nadpos.uz';
        const email = '--email admin@nadpos.uz --agree-tos --no-eff-email';
        const webroot = '--webroot -w /root/nadpos-backend/certbot/www';

        console.log('--- Requesting Certificate ---');
        const cmd = `certbot certonly ${webroot} ${domains} ${email} --non-interactive`;
        console.log(`Running: ${cmd}`);

        const cert = await ssh.execCommand(cmd);
        console.log(cert.stdout);
        console.log(cert.stderr);

        if ((cert.stdout && cert.stdout.includes('Congratulations')) || (cert.stderr && cert.stderr.includes('Congratulations'))) {
            console.log('✅ SSL Certificate Obtained Successfully!');
        } else {
            console.log('❌ Failed to obtain certificate. Check logs.');
        }

        ssh.dispose();
    } catch (error) {
        console.error('SSL Setup Phase 1 Failed:', error);
    }
}

setupSslPhase1();
