const axios = require('axios');
const multiparty = require('multiparty');
const fs = require('fs');
const FormData = require('form-data');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Vercel يحتاج أحياناً لتحديد مسار مؤقت للملفات
    const form = new multiparty.Form({ uploadDir: '/tmp' });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: 'Form Parse Error' });
        }

        const token = process.env.TELEGRAM_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!token || !chatId) {
            return res.status(500).json({ error: 'Missing Telegram Configuration' });
        }

        const caption = fields.caption ? fields.caption[0] : '';
        const photo = (files.photo && files.photo[0]) ? files.photo[0] : null;

        try {
            if (photo && photo.size > 0) {
                const formData = new FormData();
                formData.append('chat_id', chatId);
                formData.append('caption', caption);
                formData.append('photo', fs.createReadStream(photo.path));

                await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, formData, {
                    headers: formData.getHeaders(),
                });
            } else {
                await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                    chat_id: chatId,
                    text: caption,
                });
            }

            return res.status(200).json({ message: 'Success' });
        } catch (error) {
            // سجل الخطأ بالتفصيل في الـ Logs عشان نشوفه المرة الجاية
            console.error('Telegram Error:', error.response ? error.response.data : error.message);
            return res.status(500).json({ error: 'Telegram API Failure' });
        }
    });
};
