import { SB_URL, SB_KEY } from './supabase-config.js';

// استدعاء المفاتيح بأسماء Vercel الجديدة
const TG_TOKEN = import.meta.env.VITE_TELEGRAM_TOKEN || "8777804045:AAFOBr04ZZoc7gF4YshcMor90IuENcnY2ak";
const TG_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || "8363261726";

document.getElementById('uploadBtn').addEventListener('click', async () => {
    const name = document.getElementById('itemName').value;
    const year = document.getElementById('itemYear').value;
    const phone = document.getElementById('itemPhone').value;
    const desc = document.getElementById('itemDesc').value;
    const file = document.getElementById('itemFile').files[0];
    const loading = document.getElementById('loadingStatus');

    if (!file || !name) return alert("الاسم والصورة أساسيين يا هندسة!");

    loading.style.display = 'block';

    try {
        const fileName = `${Date.now()}_${file.name}`;
        const uploadRes = await fetch(`${SB_URL}/storage/v1/object/excavators/${fileName}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${SB_KEY}`, 'apikey': SB_KEY, 'Content-Type': file.type },
            body: file
        });

        if (!uploadRes.ok) throw new Error("فشل رفع الصورة للمخزن");

        const imageUrl = `${SB_URL}/storage/v1/object/public/excavators/${fileName}`;

        const dbRes = await fetch(`${SB_URL}/rest/v1/items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SB_KEY}`,
                'apikey': SB_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                name, description: desc, image_url: imageUrl, 
                year, phone, status: 'pending'
            })
        });

        if (dbRes.ok) {
            alert("تم الرفع بنجاح! في انتظار الموافقة.");
            // إرسال الإشعار لتليجرام بالأسماء الجديدة
            await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(`🚜 معدة جديدة أضيفت:\nالاسم: ${name}\nالموديل: ${year}\nللتواصل: ${phone}`)}`);
            window.location.href = 'index.html';
        } else {
            throw new Error("فشل حفظ البيانات في الجدول");
        }
    } catch (err) {
        alert("حصل خطأ: " + err.message);
    } finally {
        loading.style.display = 'none';
    }
});
