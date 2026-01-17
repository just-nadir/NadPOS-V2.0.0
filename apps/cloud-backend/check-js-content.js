const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const config = { host: '213.142.148.35', username: 'root', password: 'Nodir1998' };

(async () => {
    try {
        await ssh.connect(config);
        console.log('🔍 Grepping https://nadpos.uz/api in JS files...');
        const grep = await ssh.execCommand('grep -o "https://nadpos.uz/api" /root/nadpos-backend/public/assets/*.js');
        console.log(grep.stdout);
        ssh.dispose();
    } catch (e) { console.error(e); }
})();
