const jwt = require('jsonwebtoken');

// The format I just pushed (Explicit \n)
const KEY_WITH_LITERAL_NEWLINES = "-----BEGIN PUBLIC KEY-----\\n" +
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAovb5epqcLu9D5N6iEIUl\\n" +
    "uLTbO7KA5LojAGoViVP7sKd3HVDGBw8dEE63Ch/i/77Pv49TsbNoyUxHU4K3NidK\\n" +
    "HHUYmVaUIL9TUUx363q/7Ak4JQnyPGe3ay+slEA1HxhPTnC8pPG/JhK/pgo1v/Pd\\n" +
    "DfboiuyU8Wjjbe8UmcKWoN/hjTyHF0cGi/JG+rhP2KcBuPPlzr9FwVYkfrAtSAk3\\n" +
    "GgzVAyFz1Fwx2rnKg7EIL7qLHTHH6zmvSuHD7sK0MnYssOvSCMw15B87U4vf0oAp\\n" +
    "alC7qg7yoR7HH3mY0eKcy9f194FRbw4ZFdAfp73LgolBdoohvJQnN2NBY5/dgI21\\n" +
    "3QIDAQAB\\n" +
    "-----END PUBLIC KEY-----";

// The format that theoretically works (Template Literal)
const KEY_TEMPLATE_LITERAL = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAovb5epqcLu9D5N6iEIUl
uLTbO7KA5LojAGoViVP7sKd3HVDGBw8dEE63Ch/i/77Pv49TsbNoyUxHU4K3NidK
HHUYmVaUIL9TUUx363q/7Ak4JQnyPGe3ay+slEA1HxhPTnC8pPG/JhK/pgo1v/Pd
DfboiuyU8Wjjbe8UmcKWoN/hjTyHF0cGi/JG+rhP2KcBuPPlzr9FwVYkfrAtSAk3
GgzVAyFz1Fwx2rnKg7EIL7qLHTHH6zmvSuHD7sK0MnYssOvSCMw15B87U4vf0oAp
alC7qg7yoR7HH3mY0eKcy9f194FRbw4ZFdAfp73LgolBdoohvJQnN2NBY5/dgI21
3QIDAQAB
-----END PUBLIC KEY-----`;

async function test() {
    console.log("Testing LITERAL \\n format...");
    try {
        // Just checking if it crashes on key parsing, no need for real token yet if key is bad
        // But verify needs a token. I'll make a fake one signed with a random key just to trigger key check? 
        // No, jwt.verify(token, key) checks key first usually?

        // Actually I can verify against the LIVE token I can fetch, or just trust the error message.
        // Let's rely on the fact that jwt.verify will throw immediately if key format is wrong.

        // I will use a dummy token just to pass the first arg.
        const token = "eyJhbGciOiJSUzI1NiJ9.e30.signature";

        try {
            jwt.verify(token, KEY_WITH_LITERAL_NEWLINES, { algorithms: ['RS256'] });
        } catch (e) {
            console.log("Error with LITERAL:", e.message);
        }

        console.log("Testing TEMPLATE LITERAL format...");
        try {
            jwt.verify(token, KEY_TEMPLATE_LITERAL, { algorithms: ['RS256'] });
        } catch (e) {
            console.log("Error with TEMPLATE:", e.message);
        }

    } catch (e) {
        console.error(e);
    }
}

test();
