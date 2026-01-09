const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const config = {
    host: '213.142.148.35',
    port: 22,
    username: 'root',
    password: 'Nodir1998'
};

const localFile = path.join(__dirname, 'dist/restaurant/restaurant.controller.js');

const conn = new Client();

conn.on('ready', () => {
    console.log('SSH :: ready');

    conn.exec('find /root -name "main.js" -type f | grep "dist/main.js" | head -n 1', (err, stream) => {
        if (err) throw err;

        let remoteMainPath = '';

        stream.on('data', (data) => {
            remoteMainPath += data.toString().trim();
        }).on('close', () => {
            console.log('Remote main found at:', remoteMainPath);

            if (!remoteMainPath) {
                console.error('Could not find app location!');
                conn.end();
                return;
            }

            // Ensure forward slashes for Linux path
            // path.dirname might produce backslashes on Windows
            let distDir = path.dirname(remoteMainPath);
            // Quick fix: replace all backslashes with forward slashes if any
            distDir = distDir.replace(/\\/g, '/');

            const remoteFilePath = distDir + '/restaurant/restaurant.controller.js';

            console.log('Uploading to:', remoteFilePath);

            conn.sftp((err, sftp) => {
                if (err) throw err;

                sftp.fastPut(localFile, remoteFilePath, (err) => {
                    if (err) {
                        console.error('Upload failed:', err);
                        conn.end();
                        return;
                    }
                    console.log('✅ Upload successful!');

                    console.log('Restarting PM2 process...');
                    conn.exec('pm2 restart all', (err, stream) => {
                        stream.on('data', (d) => console.log('PM2:', d.toString()));
                        stream.on('close', () => {
                            console.log('PM2 restart command verified.');

                            // Verification Step
                            console.log('Running Verification Curl...');
                            conn.exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/restaurants', (err, stream) => {
                                stream.on('data', (d) => console.log('HTTP Status Code:', d.toString()));
                                stream.on('close', () => {
                                    conn.end();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}).connect(config);
