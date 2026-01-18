const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function verify() {
    try {
        await ssh.connect(config);

        console.log('--- 1. CONTAINER STATUS (Wait 10s...) ---');
        await new Promise(r => setTimeout(r, 10000));

        const ps = await ssh.execCommand('docker ps -a');
        console.log(ps.stdout);

        // Check if restarting
        if (ps.stdout.includes('Restarting')) {
            console.error('CRITICAL: Containers are RESTARTING!');
            // Get logs of restarting container
            if (ps.stdout.includes('nadpos_backend')) {
                const logs = await ssh.execCommand('docker logs --tail 20 nadpos_backend');
                console.log('Backend Logs:', logs.stdout || logs.stderr);
            }
            if (ps.stdout.includes('nadpos_nginx')) {
                const logs = await ssh.execCommand('docker logs --tail 20 nadpos_nginx');
                console.log('Nginx Logs:', logs.stdout || logs.stderr);
            }
        } else {
            console.log('--- 2. SUCCESS: Containers Stable! ---');

            console.log('--- 3. Curl Test ---');
            const curl = await ssh.execCommand('curl -I http://localhost:80');
            console.log(curl.stdout || curl.stderr);

            // Check if 4000 is open on host
            const netstat = await ssh.execCommand('netstat -tulnp | grep 4000');
            console.log('Host Port 4000:', netstat.stdout);
        }

        ssh.dispose();
    } catch (error) {
        console.error('Verify Failed:', error);
    }
}

verify();
