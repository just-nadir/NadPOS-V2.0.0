const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');

const config = {
    host: '213.142.148.35',
    username: 'root',
    password: 'Nodir1998'
};

const seedScriptContent = `
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const email = 'admin@nadpos.com';
  const password = 'admin'; // Simple password for initial access
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
      console.log('User already exists. Updating password...');
      await prisma.user.update({
          where: { email },
          data: { password: hashedPassword, role: 'super_admin' }
      });
  } else {
      console.log('Creating new Super Admin...');
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'super_admin',
          restaurant: {
            create: {
                name: "System Admin HQ",
                email: "system@nadpos.com", // Unique requirement
                plan: "premium",
                status: "active"
            }
          }
        },
      });
  }
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

async function seedVPS() {
    try {
        console.log('Connecting to VPS...');
        await ssh.connect(config);

        // 1. Write seed file to VPS
        // We can't use putFile easily for string content without creating a local file first.
        // Or we can just echo it into a file.
        // Let's create a local file first to be safe.
        const fs = require('fs');
        fs.writeFileSync('temp-seed.js', seedScriptContent);

        console.log('Uploading seed script...');
        await ssh.putFile('temp-seed.js', '/root/nadpos-backend/src/seed.js');

        // Cleanup local
        fs.unlinkSync('temp-seed.js');

        // 2. Execute seed inside container
        console.log('--- Running Seed ---');
        // Note: Working directory in Dockerfile is /app. 
        // We mounted src volumes? No, we COPYied them.
        // If we uploaded to /root/nadpos-backend/src/seed.js, 
        // we need to make sure this file is available inside the container.
        // Wait! The container was built from the image. 
        // New files on the host (/root/nadpos-backend) are NOT automatically in the container 
        // UNLESS a volume is mounted.
        // check docker-compose.yml: volumes: - ./data:/app/data
        // Source code is NOT mounted. 
        // So uploading to host /src/seed.js won't help unless we CP it into container.

        console.log('Copying seed to container...');
        await ssh.execCommand('docker cp /root/nadpos-backend/src/seed.js nadpos_backend:/app/src/seed.js');

        console.log('Executing node src/seed.js...');
        const result = await ssh.execCommand('docker exec nadpos_backend node src/seed.js');
        console.log(result.stdout || result.stderr);

        ssh.dispose();
    } catch (error) {
        console.error('Seed Failed:', error);
    }
}

seedVPS();
