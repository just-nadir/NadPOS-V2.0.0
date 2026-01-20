const { machineIdSync } = require('node-machine-id');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const log = require('electron-log');
const crypto = require('crypto');

const JWT_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAovb5epqcLu9D5N6iEIUl
uLTbO7KA5LojAGoViVP7sKd3HVDGBw8dEE63Ch/i/77Pv49TsbNoyUxHU4K3NidK
HHUYmVaUIL9TUUx363q/7Ak4JQnyPGe3ay+slEA1HxhPTnC8pPG/JhK/pgo1v/Pd
DfboiuyU8Wjjbe8UmcKWoN/hjTyHF0cGi/JG+rhP2KcBuPPlzr9FwVYkfrAtSAk3
GgzVAyFz1Fwx2rnKg7EIL7qLHTHH6zmvSuHD7sK0MnYssOvSCMw15B87U4vf0oAp
alC7qg7yoR7HH3mY0eKcy9f194FRbw4ZFdAfp73LgolBdoohvJQnN2NBY5/dgI21
3QIDAQAB
-----END PUBLIC KEY-----`;
const LICENSE_FILE = path.join(app.getPath('userData'), 'license.key');

class LicenseService {
    constructor() {
        this.cache = null;
        this.hwid = null;
    }

    getHWID() {
        if (this.hwid) return this.hwid;
        try {
            this.hwid = machineIdSync();
            return this.hwid;
        } catch (error) {
            log.error('HWID Error:', error);
            return 'UNKNOWN_HWID';
        }
    }

    // Litsenziya faylini o'qish va tekshirish
    async getLicense() {
        // if (this.cache) return this.cache; // Cache server sync ni to'sib qo'ymasligi kerak

        try {
            if (!fs.existsSync(LICENSE_FILE)) {
                return { status: 'MISSING', reason: 'Fayl topilmadi' };
            }

            const token = fs.readFileSync(LICENSE_FILE, 'utf8').trim();
            const decoded = jwt.decode(token);

            if (!decoded) {
                return { status: 'INVALID', reason: 'Token yaroqsiz' };
            }

            // 1. HWID tekshirish (Lokal)
            const currentHWID = this.getHWID();

            // Agar token ichida hwid bo'lsa va mos kelmasa
            if (decoded.hwid && decoded.hwid !== currentHWID) {
                // Hozircha buni o'chirib turamiz, chunki serverda login qilganda hwid yozilmagan bo'lishi mumkin
                // log.warn("HWID Mismatch", decoded.hwid, currentHWID);
            }

            // 2. Server bilan tekshirish (Sync)
            try {
                const response = await fetch('https://nadpos.uz/api/license/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ key: token, hwid: currentHWID })
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data.status === 'blocked') {
                        return { status: 'LOCKED', reason: data.message || 'Bloklangan' };
                    }

                    if (data.newToken) {
                        this.saveLicense(data.newToken);
                        const newDecoded = jwt.decode(data.newToken);
                        return { status: 'ACTIVE', ...newDecoded };
                    }

                    // Server tasdiqladi
                    return { status: 'ACTIVE', ...decoded, days_left: data.days_left };
                }
            } catch (networkError) {
                log.warn("Serverga ulanib bo'lmadi (Offline Mode):", networkError.message);
                // Offline fallback davom etadi
            }

            // 3. Offline: Muddat tekshirish logic
            // JWT exp (seconds) ni Date ga aylantiramiz
            if (decoded.exp) {
                const expDate = new Date(decoded.exp * 1000);
                if (expDate < new Date()) {
                    return { status: 'EXPIRED', reason: 'Muddat tugagan (Offline)', expires_at: expDate };
                }
            } else if (decoded.expires_at) {
                if (new Date(decoded.expires_at) < new Date()) {
                    return { status: 'EXPIRED', reason: 'Muddat tugagan', expires_at: decoded.expires_at };
                }
            }

            this.cache = { status: 'ACTIVE', ...decoded };
            return this.cache;

        } catch (error) {
            log.warn('License verification failed:', error.message);
            return { status: 'INVALID', reason: error.message };
        }
    }

    // Yangi litsenziyani saqlash
    saveLicense(token) {
        try {
            // Avval tekshirib ko'ramiz
            const decoded = jwt.decode(token);
            if (!decoded) throw new Error("Noto'g'ri token formati");

            // HWID ni tekshirish (agar token ichida bo'lsa)
            if (decoded.hwid && decoded.hwid !== this.getHWID()) {
                throw new Error("Bu litsenziya ushbu kompyuter uchun emas");
            }

            fs.writeFileSync(LICENSE_FILE, token, 'utf8');
            this.cache = null; // Keshni tozalash
            return { success: true };
        } catch (error) {
            log.error('Save License Error:', error);
            return { success: false, error: error.message };
        }
    }

    // Login (Cloud API ga so'rov yuborish)
    // Bu qism Frontendda qilingani yaxshi, lekin Backendda qilish xavfsizroq bo'lishi mumkin.
    // Hozircha frontenddan token keladi deb hisoblaymiz.
}

module.exports = new LicenseService();
