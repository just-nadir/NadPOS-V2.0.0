const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testLogin() {
    try {
        console.log('--- Testing Login API ---');
        // We use the domain to match user environment
        // Or IP to bypass Nginx cache if any
        const url = 'https://nadpos.uz/api/auth/login';

        // Use a known user or create one? 
        // Use the one created in seed: admin@nadpos.com / admin (if not changed)
        // Or the user's attempt: metadunyo23@gmail.com / (I don't know password)
        // I know admin credentials: admin@nadpos.com / admin.

        console.log(`POST ${url}...`);
        const res = await axios.post(url, {
            email: 'admin@nadpos.com',
            password: 'admin',
            hwid: 'TEST_HWID'
        });

        console.log('Response Status:', res.status);
        const { token } = res.data;
        console.log('Token received length:', token.length);

        const decoded = jwt.decode(token, { complete: true });
        console.log('--- Token Header ---');
        console.log(decoded.header);

        if (decoded.header.alg === 'RS256') {
            console.log('SUCCESS: Token is RS256');
        } else {
            console.error(`FAILURE: Token is ${decoded.header.alg} (Expected RS256)`);
        }

    } catch (error) {
        console.error('Login Failed:', error.response ? error.response.data : error.message);
    }
}

testLogin();
