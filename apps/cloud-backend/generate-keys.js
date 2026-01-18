const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateKeys() {
    console.log('Generating RSA Key Pair...');

    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    // Save locally for reference/upload
    fs.writeFileSync('private.pem', privateKey);
    fs.writeFileSync('public.pem', publicKey);

    console.log('Keys generated: private.pem, public.pem');
}

generateKeys();
