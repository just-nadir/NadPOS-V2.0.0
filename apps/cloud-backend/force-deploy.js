const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function forceDeploy() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        console.log('--- 1. Checking Docker & Compose ---');
        const dockerV = await ssh.execCommand('docker --version');
        console.log('Docker:', dockerV.stdout.trim());

        // Try both 'docker-compose' and 'docker compose'
        let composeCmd = 'docker-compose';
        const composeV = await ssh.execCommand('docker-compose --version');
        if (composeV.stderr) {
            console.log('docker-compose not found, trying "docker compose"...');
            composeCmd = 'docker compose';
        }
        console.log('Using:', composeCmd);

        console.log('--- 2. Pulling & Starting Containers ---');
        // We use --build to ensure images are created
        const cmd = `cd /root/nadpos-backend && ${composeCmd} up -d --build`;
        console.log(`Running: ${cmd}`);

        const result = await ssh.execCommand(cmd);
        console.log('STDOUT:', result.stdout);
        console.log('STDERR:', result.stderr);

        console.log('--- 3. Running Migrations ---');
        const migrate = await ssh.execCommand(`cd /root/nadpos-backend && ${composeCmd} exec -T app npx prisma migrate deploy`);
        console.log('Migrate:', migrate.stdout || migrate.stderr);

        ssh.dispose();
    } catch (error) {
        console.error('Force Deploy Failed:', error);
    }
}

forceDeploy();
