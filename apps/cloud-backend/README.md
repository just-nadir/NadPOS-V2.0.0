# NadPOS Cloud Backend

Ushbu ilova NadPOS tizimining server qismi (API) hisoblanadi. Ma'lumotlarni markaziy boshqarish va sinxronizatsiya uchun xizmat qiladi.

## Texnologiyalar
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Auth:** JWT (JSON Web Token)

## O'rnatish

1. Bog'liqliklarni o'rnatish:
   ```bash
   npm install
   ```

2. `.env` faylini sozlash (namuna):
   ```
   PORT=5000
   DATABASE_URL=postgres://user:pass@localhost:5432/nadpos
   JWT_SECRET=supersecretkey
   ```

3. Ilovani ishga tushirish:
   ```bash
   npm run dev  # Development rejimi
   npm start    # Production rejimi
   ```
