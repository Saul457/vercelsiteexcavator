const SB_URL = "https://kppufnwlkivacajmknqt.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcHVmbndsa2l2YWNham1rbnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4OTM4NTksImV4cCI6MjA5MzQ2OTg1OX0.7dzD-AYIX6HWgJJ8mU522mviRTgeV11kTazrkJl-YYk";

const TG_TOKEN = "8777804045:AAFOBr04ZZoc7gF4YshcMor90IuENcnY2ak";
const TG_CHAT_ID = "8363261726";

document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    
    if (!uploadBtn) return;

    uploadBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const name = document.getElementById('itemName').value;
        const year = document.getElementById('itemYear').value;
        const phone = document.getElementById('itemPhone').value;
        const desc = document.getElementById('itemDesc').value;
        const fileInput = document.getElementById('itemFile');
        const file = fileInput.files[0];
        const loading = document.getElementById('loadingStatus');

        if (!file || !name) {
            alert("الاسم والصورة أساسيين");
            return;
        }

        uploadBtn.disabled = true;
        uploadBtn.innerText = "جاري الرفع...";
        if (loading) loading.style.display = 'block';

        try {
            const fileName = `${Date.now()}_${file.name}`;
            // 1. رفع الصورة إلى Storage
            const uploadRes = await fetch(`${SB_URL}/storage/v1/object/excavators/${fileName}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${SB_KEY}`, 
                    'apikey': SB_KEY, 
                    'Content-Type': file.type 
                },
                body: file
            });

            if (!uploadRes.ok) throw new Error("خطأ في رفع الصورة");

            // رابط الصورة المباشر
            const imageUrl = `${SB_URL}/storage/v1/object/public/excavators/${fileName}`;

            // 2. حفظ البيانات في Database
            const dbRes = await fetch(`${SB_URL}/rest/v1/items`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SB_KEY}`,
                    'apikey': SB_KEY,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    name: name,
                    description: desc,
                    image_url: imageUrl,
                    year: year,
                    phone: phone,
                    status: 'pending'
                })
            });

            if (dbRes.ok) {
                // 3. إرسال الصورة والبيانات لتليجرام (التعديل هنا)
                const telegramMsg = `🚜 *معدة جديدة للبيع* \n\n*النوع:* ${name}\n*الموديل:* ${year}\n*التواصل:* ${phone}\n*الوصف:* ${desc}`;

                await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendPhoto`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: TG_CHAT_ID,
                        photo: imageUrl,
                        caption: telegramMsg,
                        parse_mode: 'Markdown'
                    })
                });
                
                alert("تم الرفع بنجاح ووصل التنبيه لتليجرام ✅");
                window.location.href = 'index.html';
            } else {
                throw new Error("خطأ في حفظ البيانات في القاعدة");
            }

        } catch (err) {
            alert(err.message);
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerText = "رفع المعدة الآن 🚀";
            if (loading) loading.style.display = 'none';
        }
    });
});
