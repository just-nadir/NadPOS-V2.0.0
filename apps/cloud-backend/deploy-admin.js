const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');
const fs = require('fs');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

/*
 Helper to upload a directory recursively
 We already have similar logic in deploy-ssh.js but that was for the whole backend.
 We need to sync local 'apps/admin-panel/dist' to VPS '/root/nadpos-backend/public'
 Wait, let's check docker-compose and server.js again.
 
 Dockerfile: 
   COPY --from=builder /app/public ./public (This was in the original idea)
   But currently we are running 'node src/server.js' and mounting volumes?
   
 Check server.js:
   const publicPath = path.join(__dirname, '../public');
   app.use(express.static(publicPath));
   
 Check folder structure on VPS:
   /root/nadpos-backend/public (This is where index.html is)
   
 So we need to upload 'apps/admin-panel/dist' contents to '/root/nadpos-backend/public'.
*/

async function deployAdmin() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        const localDist = path.join(__dirname, '../admin-panel/dist');
        const remotePublic = '/root/nadpos-backend/public';

        console.log(`Uploading ${localDist} to ${remotePublic}...`);

        // node-ssh putDirectory is easy
        await ssh.putDirectory(localDist, remotePublic, {
            recursive: true,
            concurrency: 10,
            validate: (itemPath) => {
                const baseName = path.basename(itemPath);
                return baseName.substring(0, 1) !== '.' && // ignore hidden files
                    baseName !== 'node_modules' // ignore node_modules
            },
            tick: (localPath, remotePath, error) => {
                if (error) console.log('Failed: ' + localPath);
                // else console.log('Uploaded: ' + localPath);
            }
        });

        console.log('Upload complete.');

        // No restart needed! Backend serves static files directly from disk.
        // But maybe verify?

        console.log('--- Verify Index Content ---');
        const index = await ssh.execCommand(`cat ${remotePublic}/index.html | head -n 20`);
        console.log(index.stdout);

        ssh.dispose();
    } catch (error) {
        console.error('Deploy Admin Failed:', error);
    }
}

deployAdmin();
