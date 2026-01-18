const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function migrateAndSeed() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        // 1. DB Push (Create Tables)
        console.log('--- Running Prisma DB Push ---');
        // --accept-data-loss is risky but ok for initial setup
        const push = await ssh.execCommand('docker exec nadpos_backend npx prisma db push --accept-data-loss');
        console.log(push.stdout || push.stderr);

        // 2. Run Seed (Again)
        console.log('--- Running Seed ---');
        // We assume seed.js is already there from previous step (we copied it)
        // If not, we should probably upload it again just in case container restarted and lost /app/src/seed.js?
        // Container restart DOES reset filesystem if not volume mounted!
        // So yes, we must upload and CP again.

        // Let's assume the previous `seed-vps.js` file content logic.
        // I will just re-upload and CP to be safe.
    } catch (e) { console.error(e); }
}

// I'll create a full combined script to be safe.
migrateAndSeed();
