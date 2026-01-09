const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const config = {
    host: '213.142.148.35',
    port: 22,
    username: 'root',
    password: 'Nodir1998'
};

const migrationFile = path.join(__dirname, 'migration_v4.sql');
const sql = fs.readFileSync(migrationFile, 'utf8');

const conn = new Client();
conn.on('ready', () => {
    console.log('SSH Client :: ready');

    const cmd = 'docker exec -i nadpos_db psql -U nadpos_root -d nadpos_cloud';

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;

        stream.on('close', (code, signal) => {
            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
            conn.end();
            if (code === 0) {
                console.log("✅ Migration V4 applied successfully!");
                process.exit(0);
            } else {
                console.error("❌ Migration V4 failed.");
                process.exit(1);
            }
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });

        stream.write(sql);
        stream.end();
    });
}).on('error', (err) => {
    console.error("SSH Connect Error:", err);
    process.exit(1);
}).connect(config);
