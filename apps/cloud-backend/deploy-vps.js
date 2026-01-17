const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ssh = new NodeSSH();

// VPS Config
const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998', // Sensitive data, only for this session
};

const REMOTE_DIR = '/root/nadpos-backend';
const LOCAL_TAR = 'deploy.tar';

(async () => {
    try {
        console.log('🔗 Connecting to VPS...');
        await ssh.connect(config);
        console.log('✅ Connected!');

        // 1. Cleanup (Safe)
        console.log('🧹 Cleaning up remote code (keeping certs)...');
        // We only remove common code folders/files to ensure clean deploy
        // preserving 'certbot', 'node_modules', '.env', 'nginx' (we overwrite nginx config via tar anyway but keeps folder)
        // Actually, tar overwrites, so we might just need to remove 'dist' or 'src' if we renamed things.
        // For now, let's just NOT delete the whole directory.
        // Maybe delete 'src' and 'public' to be sure?
        // await ssh.execCommand('rm -rf src public', { cwd: REMOTE_DIR });

        // 2. Prepare Local Archieve
        console.log('📦 Archiving local files...');
        // Windows 'tar' command (supported in Win 10+)
        // Exclude node_modules, .git, etc.
        try {
            if (fs.existsSync(LOCAL_TAR)) fs.unlinkSync(LOCAL_TAR);

            // Using system tar. Note: Syntax might vary on Powershell vs CMD, but 'tar' usually works.
            // Excluding node_modules is critical.
            // On Windows tar --exclude pattern might be tricky.
            // Simple approach: tar everything, but we need to supply list.

            // Let's rely on standard tar command behavior.
            // "tar -cvf deploy.tar --exclude=node_modules ."
            execSync(`tar --exclude "node_modules" --exclude ".git" --exclude "deploy.tar" -cf ${LOCAL_TAR} .`);
        } catch (e) {
            console.error('❌ Tar failed:', e.message);
            process.exit(1);
        }

        // 3. Upload
        console.log('🚀 Uploading files...');
        await ssh.putFile(LOCAL_TAR, `${REMOTE_DIR}/${LOCAL_TAR}`);

        // 4. Extract & Setup
        console.log('📂 Extracting on VPS...');
        await ssh.execCommand(`tar -xf ${LOCAL_TAR}`, { cwd: REMOTE_DIR });
        await ssh.execCommand(`rm ${LOCAL_TAR}`, { cwd: REMOTE_DIR });

        // 5. Create .env for Production (Docker)
        console.log('⚙️ Configuring environment...');
        const prodEnv = `
PORT=4000
DATABASE_URL="postgresql://admin:password@db:5432/nadpos_cloud?schema=public"
JWT_SECRET="nadpos_super_secret_key_v2_2024"
# HTTPS support is handled by Nginx, app still runs on 4000
        `.trim();

        // Write .env file remotely
        await ssh.execCommand(`echo '${prodEnv}' > .env`, { cwd: REMOTE_DIR });

        // 6. Start Docker (Force Rebuild)
        console.log('🐳 Starting Docker containers (No Cache)...');
        // Added --no-cache to ensure new assets are copied
        const result = await ssh.execCommand('docker-compose up -d --build --force-recreate', { cwd: REMOTE_DIR });
        console.log(result.stdout);
        console.log(result.stderr);

        // Force reload Nginx to apply any config changes from volume
        console.log('🔄 Reloading Nginx...');
        await ssh.execCommand('docker-compose exec -T nginx nginx -s reload', { cwd: REMOTE_DIR });

        // 7. Prisma Deploy (Wait a bit for DB to start)
        console.log('⏳ Waiting for Database...');
        await new Promise(r => setTimeout(r, 10000));

        console.log('🗄️ Running Migrations...');
        const migrate = await ssh.execCommand('docker-compose exec -T app npx prisma migrate deploy', { cwd: REMOTE_DIR });
        console.log(migrate.stdout);
        console.log(migrate.stderr);

        console.log('✨ Deployment Completed Successfully!');

        // Get running containers
        const ps = await ssh.execCommand('docker-compose ps', { cwd: REMOTE_DIR });
        console.log('\nStatus:\n' + ps.stdout);

        ssh.dispose();

    } catch (error) {
        console.error('❌ Deployment Failed:', error);
        ssh.dispose();
        process.exit(1);
    }
})();
