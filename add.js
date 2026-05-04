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
                    name: name,
                    description: desc,
                    image_url: imageUrl,
                    year: year,
                    phone: phone,
                    status: 'pending'
                })
            });

            if (dbRes.ok) {
                const msg = `🚜 معدة جديدة:\nالاسم: ${name}\nالموديل: ${year}\nتلفون: ${phone}`;
                await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(msg)}`);
                
                alert("تم الرفع بنجاح");
                window.location.href = 'index.html';
            } else {
                throw new Error("خطأ في حفظ البيانات");
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
