const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

async function createTestPage() {
    try {
        await ssh.connect(config);

        const html = `
        <!DOCTYPE html>
        <html>
        <head><title>Test Page</title></head>
        <body style="background-color: #f0f0f0; padding: 20px; font-family: sans-serif;">
            <h1 style="color: green;">Server is Working!</h1>
            <p>If you see this, static files are being served correctly.</p>
            <p>Server Time: ${new Date().toISOString()}</p>
        </body>
        </html>
        `;

        // Write to a temp file then upload
        const fs = require('fs');
        fs.writeFileSync('test.html', html);
        await ssh.putFile('test.html', '/root/nadpos-backend/public/test.html');
        fs.unlinkSync('test.html');

        // Copy to container
        await ssh.execCommand('docker cp /root/nadpos-backend/public/test.html nadpos_backend:/app/public/test.html');

        console.log('Test page created at /root/nadpos-backend/public/test.html and copied to container.');

        ssh.dispose();
    } catch (e) { console.error(e); }
}

createTestPage();
