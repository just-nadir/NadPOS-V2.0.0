const axios = require('axios');

async function testSuperAdmin() {
    try {
        console.log('--- 1. Login as Super Admin ---');
        const loginRes = await axios.post('https://nadpos.uz/api/auth/login', {
            email: 'owner@nadpos.com',
            password: 'owner',
            hwid: 'TEST_SA_CHECKER'
        });
        const token = loginRes.data.token;
        const role = loginRes.data.user.role;
        console.log(`Logged in. Role: ${role}`);

        if (role !== 'super_admin') {
            console.error('ERROR: Role is not super_admin!');
            return;
        }

        console.log('--- 2. Get All Restaurants ---');
        const listRes = await axios.get('https://nadpos.uz/api/super-admin/restaurants', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Status:', listRes.status);
        console.log('Restaurants Found:', listRes.data.length);
        if (listRes.data.length > 0) {
            console.log('Sample:', listRes.data[0]);
        }

        console.log('✅ Super Admin API Works!');

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

testSuperAdmin();
