const { Client } = require('ssh2');

const config = {
    host: '213.142.148.35',
    port: 22,
    username: 'root',
    password: 'Nodir1998'
};

const conn = new Client();
conn.on('ready', () => {
    console.log('SSH Client :: ready');

    // Query to list columns of specific tables
    const sql = `
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name IN ('sales', 'debt_history')
        ORDER BY table_name, column_name;
    `;

    // Wrap in PSQL command
    const cmd = `docker exec -i nadpos_db psql -U nadpos_root -d nadpos_cloud -c "${sql}"`;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            console.log(data.toString());
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).on('error', (err) => {
    console.error("SSH Connect Error:", err);
    process.exit(1);
}).connect(config);
