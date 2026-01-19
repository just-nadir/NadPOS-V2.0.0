const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function forceSeed() {
    try {
        console.log('Connecting...');
        await ssh.connect(config);

        console.log('--- Uploading Seed Script ---');
        await ssh.putFile(
            path.join(__dirname, 'create-super-admin.js'),
            '/root/nadpos-backend/create-super-admin.js'
        );

        console.log('--- Copying to Container ---');
        await ssh.execCommand('docker cp /root/nadpos-backend/create-super-admin.js nadpos_backend:/app/create-super-admin.js');

        console.log('--- Running Seeding ---');
        const seed = await ssh.execCommand('docker exec nadpos_backend node create-super-admin.js');
        console.log('STDOUT:', seed.stdout);
        console.log('STDERR:', seed.stderr);

        console.log('Done!');
        ssh.dispose();
    } catch (e) {
        console.error(e);
    }
}

forceSeed();
