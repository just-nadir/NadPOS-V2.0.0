const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

const verifyScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    try {
        const user = await prisma.user.findUnique({ where: { email: 'admin@nadpos.com' } });
        console.log(user ? 'User FOUND: ' + user.email : 'User NOT FOUND');
    } catch(e) { console.error(e); }
    finally { await prisma.$disconnect(); }
}
run();
`;

async function verifySeed() {
    try {
        await ssh.connect(config);

        // Write verify script to file inside container directly using echo?
        // Risky with quotes. Let's upload to host then cp.
        const fs = require('fs');
        fs.writeFileSync('temp-verify.js', verifyScript);

        await ssh.putFile('temp-verify.js', '/root/nadpos-backend/src/verify.js');
        fs.unlinkSync('temp-verify.js');

        await ssh.execCommand('docker cp /root/nadpos-backend/src/verify.js nadpos_backend:/app/src/verify.js');

        const res = await ssh.execCommand('docker exec nadpos_backend node src/verify.js');
        console.log(res.stdout || res.stderr);

        ssh.dispose();
    } catch (error) {
        console.error('Verify Failed:', error);
    }
}

verifySeed();
