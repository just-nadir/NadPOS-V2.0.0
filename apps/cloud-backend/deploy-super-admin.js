const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function deploySuperAdmin() {
    try {
        console.log('Connecting...');
        await ssh.connect(config);

        console.log('--- Uploading Backend Files ---');
        await ssh.putFiles([
            { local: path.join(__dirname, 'src/controllers/superAdminController.js'), remote: '/root/nadpos-backend/src/controllers/superAdminController.js' },
            { local: path.join(__dirname, 'src/routes/superAdminRoutes.js'), remote: '/root/nadpos-backend/src/routes/superAdminRoutes.js' },
            { local: path.join(__dirname, 'src/server.js'), remote: '/root/nadpos-backend/src/server.js' },
            { local: path.join(__dirname, 'create-super-admin.js'), remote: '/root/nadpos-backend/create-super-admin.js' }
        ]);

        console.log('--- Rebuilding Backend ---');
        // Restart to apply server.js changes
        await ssh.execCommand('docker-compose up -d --build app', { cwd: '/root/nadpos-backend' });

        console.log('--- Waiting for DB ---');
        await new Promise(r => setTimeout(r, 5000));

        console.log('--- Copying Seeding Script ---');
        await ssh.execCommand('docker cp /root/nadpos-backend/create-super-admin.js nadpos_backend:/app/create-super-admin.js');

        console.log('--- Running Seeding ---');
        const seed = await ssh.execCommand('docker exec nadpos_backend node create-super-admin.js');
        console.log(seed.stdout || seed.stderr);

        console.log('Done!');
        ssh.dispose();
    } catch (e) {
        console.error(e);
    }
}

deploySuperAdmin();
