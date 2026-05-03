const axios = require('axios');
const multiparty = require('multiparty');
const fs = require('fs');
const FormData = require('form-data');

module.exports = async (req, res) => {
    // التأكد من أن الطلب POST فقط
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'الطريقة غير مسموح بها' });
    }

    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing form:', err);
            return res.status(500).json({ error: 'خطأ في معالجة البيانات' });
        }

        const token = process.env.TELEGRAM_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        const caption = fields.caption ? fields.caption[0] : 'لا يوجد وصف';
        const photo = files.photo ? files.photo[0] : null;

        try {
            if (photo) {
                // إرسال صورة مع وصف
                const formData = new FormData();
                formData.append('chat_id', chatId);
                formData.append('caption', caption);
                formData.append('photo', fs.createReadStream(photo.path));

                await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, formData, {
                    headers: formData.getHeaders(),
                });
            } else {
                // إرسال نص فقط في حال عدم وجود صورة
                await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                    chat_id: chatId,
                    text: caption,
                });
            }

            return res.status(200).json({ message: 'تم الإرسال بنجاح!' });
        } catch (error) {
            console.error('Telegram API Error:', error.response ? error.response.data : error.message);
            return res.status(500).json({ error: 'فشل الإرسال إلى تلغرام' });
        }
    });
};
