const axios = require('axios');

const sendToTelegram = async (req, res) => {
    try {
        const { name, phone } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ error: "Ism va telefon raqam talab qilinadi" });
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            console.error("Telegram Bot Token yoki Chat ID topilmadi");
            return res.status(500).json({ error: "Server konfiguratsiya xatosi: Bot sozlanmagan" });
        }

        const message = `
🛎 <b>Yangi So'rov!</b>

👤 <b>Ism:</b> ${name}
📞 <b>Telefon:</b> ${phone}
📅 <b>Vaqt:</b> ${new Date().toLocaleString()}
        `;

        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        });

        res.status(200).json({ success: true, message: "Xabar yuborildi" });

    } catch (error) {
        console.error("Telegramga yuborishda xatolik:", error);
        res.status(500).json({ error: "Xabar yuborishda xatolik yuz berdi" });
    }
};

module.exports = { sendToTelegram };
