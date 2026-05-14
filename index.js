/**
 * 👑 𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷 - 𝑷𝑹𝑶 𝑬𝑫𝑰𝑻𝑰𝑶𝑵 👑
 * النسخة الحقيقية المجهزة للتعامل مع 1500 جلسة وتوجيه ضربات فعلية 😈
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
// ⚙️ إعدادات التحكم
// ==========================================
const TG_TOKEN = '8831436238:AAF9M5hGwNbQwfoLKOr_XYS2Qij6WOA7Krw'; 
const OWNER_ID = '8794826397'; 
const DB_FILE = './tarzan.json'; // تم توحيد قاعدة البيانات المحلية حصرياً لتكون خفيفة وسريعة

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
// 🔥 محرك الواتساب (النظام الأساسي المحسن لـ 1500 جلسة)
// ==========================================

async function startWhatsAppSession(sessionId, phoneNumber = null, tgContext = null) {
    const sessionDir = path.join(__dirname, 'sessions', sessionId);
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    // ⚠️ تحسينات الذاكرة الخطيرة: إيقاف المزامنة تماماً لمنع انهيار الرام مع 1500 حساب
    const sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ["Windows", "Edge", "110.0.1587.41"],
        syncFullHistory: false, // إجباري لمنع سحب الرسائل
        markOnlineOnConnect: false, // لتقليل استهلاك الباندويث والموارد
        generateHighQualityLinkPreview: false,
        getMessage: async () => { return { conversation: '' } } // تفريغ الذاكرة فوراً
    });

    activeSockets[sessionId] = sock;
    sock.ev.on('creds.update', saveCreds);

    if (phoneNumber && !sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                if (tgContext) {
                    await tgContext.replyWithHTML(
                        `<b>🔱 تم استخراج كود الربط بنجاح 🔱</b>\n\n` +
                        `🔑 الكود: <code>${code}</code>\n\n` +
                        `أدخل الكود في واتساب لتفعيل النظام.`
                    );
                }
            } catch (e) {
                if (tgContext) await tgContext.reply("❌ تعذر إصدار الكود، يرجى التأكد من الرقم والمحاولة لاحقاً.");
            }
        }, 3000);
    }

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();

        // 💀 أمر المعالجة (.ben) - الهجوم الحقيقي الموازي
        if (body.startsWith('.ben ')) {
            const target = body.split(' ')[1];
            if (!target) return;
            const targetJid = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            
            await sock.sendMessage(from, { text: `⚔️ <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑷𝑹𝑶𝑪𝑬𝑺𝑺𝑰𝑵𝑮</b> ⚔️\n\n🎯 <b>المستخدم:</b> ${target}\n⚙️ <b>الحالة:</b> يتم الآن توجيه جيش التفاعل لإرسال البلاغات الحقيقية دفعة واحدة...` }, { quoted: msg });

            let totalHits = 0;
            const allSockets = Object.values(activeSockets);
            const networkSize = allSockets.length;

            // تقسيم الهجوم إلى دفعات (Batches) لضمان عدم انهيار السيرفر أو حظر الأيبيهات
            const chunkSize = 25; 
            
            for (let i = 0; i < allSockets.length; i += chunkSize) {
                const chunk = allSockets.slice(i, i + chunkSize);
                
                // إرسال البلاغات بشكل متوازي (Parallel) للدفعة الواحدة
                await Promise.all(chunk.map(async (sck) => {
                    try {
                        // إرسال طلب البلاغ والحظر الفعلي لخوادم واتساب
                        await sck.updateBlockStatus(targetJid, 'block');
                        await sck.reportSpam(targetJid);
                        totalHits++;
                    } catch (e) {
                        // نتجاهل الأخطاء الفردية حتى لا يتوقف الهجوم
                    }
                }));
                // تأخير ذكي بين كل 25 حساب لتجنب حظر الـ IP الخاص بسيرفرك
                await delay(1200); 
            }

            await sock.sendMessage(from, { text: `✅ <b>اكتملت المهمة بنجاح</b>\n\n📈 إجمالي الإبلاغات الفعلية: ${totalHits}\n🔗 الأنظمة المشاركة: ${networkSize}\n\n<i>تم ضرب الهدف بنجاح.</i>` }, { quoted: msg });
        }

        // 📢 أمر المتابعة (.متابعه) - معالجة سريعة
        if (body.startsWith('.متابعه ') || body.startsWith('.متابعة ')) {
            const link = body.split(' ')[1];
            if (!link || !link.includes('whatsapp.com/channel/')) {
                return sock.sendMessage(from, { text: '⚠️ عذراً، الرابط غير صحيح.' });
            }
            const inviteCode = link.split('channel/')[1].split('/')[0];
            
            await sock.sendMessage(from, { text: `🔄 <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑺𝑼𝑷𝑷𝑶𝑹𝑻</b> 🔄\n\n⏳ جاري تفعيل المتابعة...` }, { quoted: msg });

            let count = 0;
            const allSockets = Object.values(activeSockets);
            const chunkSize = 20;

            for (let i = 0; i < allSockets.length; i += chunkSize) {
                const chunk = allSockets.slice(i, i + chunkSize);
                await Promise.all(chunk.map(async (sck) => {
                    try {
                        const meta = await sck.newsletterMetadata("invite", inviteCode);
                        if (meta?.id) {
                            await sck.newsletterFollow(meta.id);
                            count++;
                        }
                    } catch (e) {}
                }));
                await delay(1000);
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
            if (!db.sessions[sessionId]) db.sessions[sessionId] = {};
            if (!db.sessions[sessionId].welcomeSent) {
                try {
                    const selfId = jidNormalizedUser(sock.user.id);
                    await sock.sendMessage(selfId, { text: `👑 <b>أهلاً بك في نظام 𝑻𝑨𝑹𝒁𝑨𝑵 𝑷𝑹𝑶</b> 👑\nتم الربط بنجاح.` });
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
        return ctx.replyWithHTML("❌ <b>النظام حالياً في وضع VIP</b>");
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
    }

    ctx.replyWithHTML(
        `🔱 <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑷𝑹𝑶 𝑺𝒀𝑺𝑻𝑬𝑴</b> 🔱\n\n` +
        `👤 <b>الرتبة:</b> <code>${roleName}</code>\n` +
        `⚙️ <b>الأنظمة النشطة:</b> <code>${activeSessionsCount}</code>`,
        Markup.inlineKeyboard(buttons)
    );
});

bot.action('action_pair', (ctx) => {
    userStates[ctx.from.id] = { action: 'WAIT_PHONE' };
    ctx.replyWithHTML("📱 <b>يرجى إرسال رقم الهاتف:</b>");
});

bot.action('server_status', (ctx) => {
    ctx.replyWithHTML(`📊 <b>الجلسات النشطة:</b> ${Object.keys(activeSockets).length}`);
});

bot.on('text', async (ctx) => {
    const uid = ctx.from.id;
    const state = userStates[uid];
    if (!state) return;
    const text = ctx.message.text.trim();

    if (state.action === 'WAIT_PHONE') {
        const phone = text.replace(/[^0-9]/g, '');
        ctx.replyWithHTML("⏳ جاري التواصل مع الخادم...");
        const sId = `SESSION_${Date.now()}`;
        db.sessions[sId] = { ownerTgId: uid, phone: phone };
        saveDB();
        await startWhatsAppSession(sId, phone, ctx);
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
    // التشغيل المتسلسل السريع للجلسات القديمة
    for (const f of folders) {
        try { await startWhatsAppSession(f); await delay(500); } catch (e) {}
    }
    
    bot.launch();
    console.log("✅ Tarzan Pro System is ready and active.");
};

init();

process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});
