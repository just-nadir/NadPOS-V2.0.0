const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const fs = require('fs');

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
  const password = 'admin';
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
      console.log('User exists. Updating...');
      await prisma.user.update({
          where: { email },
          data: { password: hashedPassword, role: 'super_admin' }
      });
  } else {
      console.log('Creating Super Admin...');
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'super_admin',
          restaurant: {
            create: { name: "System Admin HQ", email: "system@nadpos.com", plan: "premium", status: "active" }
          }
        },
      });
  }
  console.log('Seeding completed.');
}
main().catch(console.error).finally(()=>prisma.$disconnect());
`;

async function run() {
    try {
        await ssh.connect(config);

        console.log('--- 1. Prisma DB Push ---');
        const push = await ssh.execCommand('docker exec nadpos_backend npx prisma db push --accept-data-loss');
        console.log(push.stdout || push.stderr);

        console.log('--- 2. Upload Seed ---');
        fs.writeFileSync('temp-seed.js', seedScriptContent);
        await ssh.putFile('temp-seed.js', '/root/nadpos-backend/src/seed.js');
        fs.unlinkSync('temp-seed.js');

        await ssh.execCommand('docker cp /root/nadpos-backend/src/seed.js nadpos_backend:/app/src/seed.js');

        console.log('--- 3. Run Seed ---');
        const seed = await ssh.execCommand('docker exec nadpos_backend node src/seed.js');
        console.log(seed.stdout || seed.stderr);

        ssh.dispose();
    } catch (e) { console.error(e); }
}

run();
