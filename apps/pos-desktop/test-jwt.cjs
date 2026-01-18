const jwt = require('jsonwebtoken');

try {
    const secret = "super_secret_key";
    console.log("Signing with secret string but algorithm RS256...");
    const token = jwt.sign({ foo: 'bar' }, secret, { algorithm: 'RS256' });
    console.log("Token signed successfully (Unexpected!)");
    console.log("Token:", token);

    // Check header
    const decoded = jwt.decode(token, { complete: true });
    console.log("Header:", decoded.header);
} catch (e) {
    console.log("Caught expected error:", e.message);
}
