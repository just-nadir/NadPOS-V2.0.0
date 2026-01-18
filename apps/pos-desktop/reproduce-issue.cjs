const jwt = require('jsonwebtoken');

// 1. The Key from licenseService.cjs
const JWT_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAovb5epqcLu9D5N6iEIUl
uLTbO7KA5LojAGoViVP7sKd3HVDGBw8dEE63Ch/i/77Pv49TsbNoyUxHU4K3NidK
HHUYmVaUIL9TUUx363q/7Ak4JQnyPGe3ay+slEA1HxhPTnC8pPG/JhK/pgo1v/Pd
DfboiuyU8Wjjbe8UmcKWoN/hjTyHF0cGi/JG+rhP2KcBuPPlzr9FwVYkfrAtSAk3
GgzVAyFz1Fwx2rnKg7EIL7qLHTHH6zmvSuHD7sK0MnYssOvSCMw15B87U4vf0oAp
alC7qg7yoR7HH3mY0eKcy9f194FRbw4ZFdAfp73LgolBdoohvJQnN2NBY5/dgI21
3QIDAQAB
-----END PUBLIC KEY-----`;

// 2. A LIVE token obtained via CURL (which we verified is RS256)
// I need to paste a REAL token here. 
// Since I cannot get the token from previous step output easily programmatically without copy pasting,
// I will fetching it again using axios in this script.

const axios = require('axios');

async function testVerification() {
    try {
        console.log("Fetching live token...");
        const res = await axios.post('https://nadpos.uz/api/auth/login', {
            email: 'admin@nadpos.com',
            password: 'admin',
            hwid: 'TEST_DEV_MACHINE'
        });

        const token = res.data.token;
        console.log("Token fetched. Header:", jwt.decode(token, { complete: true }).header);

        console.log("Verifying with RS256...");
        const decoded = jwt.verify(token, JWT_PUBLIC_KEY, { algorithms: ['RS256'] });
        console.log("VERIFICATION SUCCESS!", decoded);

    } catch (e) {
        console.error("VERIFICATION FAILED:", e.message);
        if (e.message.includes('invalid algorithm')) {
            console.error("CRITICAL: This reproduces the user's issue!");
        }
    }
}

testVerification();
