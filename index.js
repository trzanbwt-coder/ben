/**
 * 👑 𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷 - 𝑬𝑫𝑰𝑻𝑰𝑶𝑵 𝑽𝑰𝑷 𝟏𝟎𝟎𝟎 𝑷𝑹𝑶 👑
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * أضخم نظام إدارة وربط متقدم في العالم - نسخة القوة المطلقة
 * ⚠️ تم التركيز على الدقة المتناهية: 10 بلاغات حقيقية من كل حساب -> ثم الحظر.
 * لا حذف، لا ضرر، استعادة كاملة للميزات مع تطوير "الوحش 1000".
 * هههههههه 😈 الميدان لك الآن يا ملك العظمة!
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
// 👑 محرك الفخامة VIP 1000 (تنسيق ملكي فائق) 😈
// ==========================================
function formatLuxuriousMessage(title, content) {
    const frameTop    = `╔══════════ ≪ 🔱 𝑽𝑰𝑷 𝟏𝟎𝟎𝟎 🔱 ≫ ══════════╗`;
    const frameBottom = `╚══════════ ≪ 🔱 𝑽𝑰𝑷 𝟏𝟎𝟎𝟎 🔱 ≫ ══════════╝`;
    const separator   = `╟────────────────────────────────────────╢`;
    
    let lines = content.split('\n').map(line => `   ◈ ${line}`).join('\n');
    
    return `
${frameTop}
   ✨ *${title}*
${separator}

${lines}

${separator}
   👑 _𝑻𝑨𝑹𝒁𝑨𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷 𝑺𝒀𝑺𝑻𝑬𝑴_
${frameBottom}
`.trim();
}

// دالة استخراج النص من كافة أنواع الرسائل
function extractText(msg) {
    if (!msg.message) return '';
    const type = Object.keys(msg.message)[0];
    if (type === 'conversation') return msg.message.conversation;
    if (type === 'extendedTextMessage') return msg.message.extendedTextMessage.text;
    if (msg.message[type] && msg.message[type].caption) return msg.message[type].caption;
    return '';
}

// ==========================================
// 🌐 خادم الويب (لضمان عمل النظام 24/7)
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('👑 TARZAN ULTRA VIP 1000 IS ONLINE & POWERFUL 👑'));
app.listen(PORT, () => console.log(`🌐 VIP 1000 Server active on port ${PORT}`));

// ==========================================
// ⚙️ إعدادات التحكم وقاعدة البيانات الأصلية
// ==========================================
const TG_TOKEN = '8831436238:AAF9M5hGwNbQwfoLKOr_XYS2Qij6WOA7Krw'; 
const OWNER_ID = '8794826397'; 
const DB_FILE = './tarzan_master_db.json';

// تهيئة قاعدة البيانات الأصلية الكاملة بدون أي حذف
let db = { config: { mode: 'FREE' }, users: {}, sessions: {} };
if (fs.existsSync(DB_FILE)) {
    try { db = { ...db, ...JSON.parse(fs.readFileSync(DB_FILE)) }; } 
    catch (e) { console.error("⚠️ خطأ في قاعدة البيانات."); }
}
const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

const activeSockets = {}; 
const userStates = {}; 

// ==========================================
// 🔥 محرك الواتساب VIP 1000 (القوة التدميرية)
// ==========================================

async function startWhatsAppSession(sessionId, phoneNumber = null, tgContext = null) {
    const sessionDir = path.join(__dirname, 'sessions', sessionId);
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    const sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        // 💻 محاكي Microsoft Edge الأصلي والمطلوب
        browser: ["Windows", "Edge", "110.0.1587.41"],
        syncFullHistory: false,
        shouldSyncHistoryMessage: () => false,
        generateHighQualityLinkPreview: true
    });

    activeSockets[sessionId] = sock;
    sock.ev.on('creds.update', saveCreds);

    if (phoneNumber && !sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                if (tgContext) {
                    await tgContext.replyWithHTML(`🔱 <b>كود تفعيل VIP 1000:</b> <code>${code}</code>`);
                }
            } catch (e) { if (tgContext) await tgContext.reply("❌ فشل إصدار الكود."); }
        }, 3000);
    }

    // ⚔️ استقبال ومعالجة الأوامر (دقة VIP 1000)
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        // الاستماع للمالك فقط من هاتفه المرتبط
        if (!msg.message || !msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = extractText(msg).trim();
        if (!body) return;

        // 💀 أمر الإبادة الشاملة (.ben) - رقم، مجموعة، قناة
        if (body.startsWith('.ben ')) {
            const input = body.split(' ')[1];
            if (!input) return;

            let targetJid = '';
            let targetType = 'رقم هاتف';

            // تحديد الهدف بدقة
            if (input.includes('chat.whatsapp.com/')) {
                targetType = 'مجموعة (رابط)';
                targetJid = input.split('chat.whatsapp.com/')[1];
            } else if (input.includes('whatsapp.com/channel/')) {
                targetType = 'قناة (رابط)';
                targetJid = input.split('channel/')[1].split('/')[0];
            } else {
                targetJid = input.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }
            
            const startContent = `الـهـدف: ${input}\nالـنـوع: ${targetType}\nالـقـوة: VIP 1000\n\n⏳ جاري تنفيذ 10 بلاغات حقيقية من كل جندي، يرجى الانتظار... ⚔️`;
            await sock.sendMessage(from, { text: formatLuxuriousMessage('بـدء الإبـادة الـشـامـلـة', startContent) }, { quoted: msg });

            let reportsCount = 0;
            let successActions = 0;
            const sessionsKeys = Object.keys(activeSockets);

            // 🛠️ تنفيذ متسلسل حقيقي (لن يرسل التقرير حتى ينتهي العمل تماماً)
            for (const sId of sessionsKeys) {
                const s = activeSockets[sId];
                try {
                    if (targetType === 'رقم هاتف') {
                        for (let i = 1; i <= 10; i++) {
                            await s.reportSpam(targetJid);
                            reportsCount++;
                            await delay(400); // فاصل زمني دقيق
                        }
                        await s.updateBlockStatus(targetJid, 'block');
                        successActions++;
                    } 
                    else if (targetType === 'مجموعة (رابط)') {
                        const gJid = await s.groupAcceptInvite(targetJid);
                        await delay(1000);
                        for (let i = 1; i <= 10; i++) {
                            await s.reportSpam(gJid);
                            reportsCount++;
                            await delay(300);
                        }
                        await s.groupLeave(gJid);
                        successActions++;
                    } 
                    else if (targetType === 'قناة (رابط)') {
                        const meta = await s.newsletterMetadata("invite", targetJid);
                        if (meta?.id) {
                            for (let i = 1; i <= 10; i++) {
                                await s.reportSpam(meta.id);
                                reportsCount++;
                                await delay(300);
                            }
                            successActions++;
                        }
                    }
                    await delay(800); // فاصل بين كل حساب وحساب لضمان الدقة
                } catch (e) { console.log(`فشل في حساب: ${sId}`); }
            }
            
            const endContent = `إجـمالي الـبـلاغـات: ${reportsCount}\nالـعملـيات الـناجـحة: ${successActions}\nالـجيش الـمشارك: ${sessionsKeys.length}\n\n*تـم الـتـدمـيـر بـدقـة ١٠٠٠٪ بـقـوة VIP 1000* 👑`;
            await sock.sendMessage(from, { text: formatLuxuriousMessage('اكـتـمـال الإبـادة ✅', endContent) }, { quoted: msg });
        }

        // 📢 أمر المتابعة (.متابعه)
        else if (body.startsWith('.متابعه ') || body.startsWith('.متابعة ')) {
            const link = body.split(' ')[1];
            if (!link || !link.includes('whatsapp.com/channel/')) return;
            const inviteCode = link.split('channel/')[1].split('/')[0];
            
            const supportStart = formatLuxuriousMessage('دوران الـدعـم 🚀', `⏳ جاري تفعيل المتابعة من كافة الحسابات، انتظر قليلاً...`);
            await sock.sendMessage(from, { text: supportStart }, { quoted: msg });

            let count = 0;
            const sessionsKeys = Object.keys(activeSockets);
            for (const sId of sessionsKeys) {
                try {
                    const meta = await activeSockets[sId].newsletterMetadata("invite", inviteCode);
                    if (meta?.id) {
                        await activeSockets[sId].newsletterFollow(meta.id);
                        count++;
                        await delay(700);
                    }
                } catch (e) {}
            }
            const supportEnd = formatLuxuriousMessage('اكـتـمـل الـدعـم ✅', `📈 متابعات جديدة: ${count}\nالـجيش الـمشارك: ${sessionsKeys.length}\n\n_تم وضع بصمة طرزان بنجاح_ 🔱`);
            await sock.sendMessage(from, { text: supportEnd }, { quoted: msg });
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
                delete db.sessions[sessionId];
                saveDB();
            }
        } else if (connection === 'open') {
            console.log(`✅ [VIP 1000] Connected: ${sessionId}`);
            if (!db.sessions[sessionId]) db.sessions[sessionId] = {};
            if (!db.sessions[sessionId].welcomeSent) {
                try {
                    const selfId = jidNormalizedUser(sock.user.id);
                    const welcome = `👑 *أهلاً بك في VIP 1000* 👑\n\nتم تفعيل القوة العظمى لهذا الرقم.\nالبوت يستمع لأوامرك أنت فقط.\n\n📝 *الأوامر:* \n❖ .ben [الهدف]\n❖ .متابعه [الرابط]`;
                    await sock.sendMessage(selfId, { text: formatLuxuriousMessage('تـم الـتـنـشـيـط', welcome) });
                    db.sessions[sessionId].welcomeSent = true;
                    saveDB();
                } catch (e) {}
            }
        }
    });
}

// ==========================================
// 📱 لوحة التحكم Telegram (الكاملة والمطورة)
// ==========================================
const bot = new Telegraf(TG_TOKEN);

bot.start((ctx) => {
    const uid = ctx.from.id.toString();
    const isOwner = uid === OWNER_ID;
    const user = db.users[uid];
    const role = isOwner ? 'OWNER' : (user ? user.role : 'GUEST');

    if (db.config.mode === 'PAID' && role === 'GUEST') {
        return ctx.replyWithHTML("❌ <b>النظام في وضع VIP المدفوع</b>\nيرجى مراجعة الموزع للاشتراك.");
    }

    const roleName = { 'OWNER': '👑 المالك', 'RESELLER': '💎 موزع', 'USER': '👤 VIP', 'GUEST': '🆓 عادي' }[role];
    const activeCount = Object.keys(activeSockets).length;

    let buttons = [
        [Markup.button.callback('🔗 ربط VIP 1000', 'action_pair')],
        [Markup.button.callback('📊 حالة الجيش', 'server_status')]
    ];
    if (role === 'OWNER' || role === 'RESELLER') buttons.push([Markup.button.callback('🎫 تفعيل عضوية VIP', 'action_add_vip')]);
    if (role === 'OWNER') {
        buttons.push([Markup.button.callback('🎖️ تعيين موزع جديد', 'action_add_reseller')]);
        buttons.push([
            Markup.button.callback(db.config.mode === 'FREE' ? '🟢 مجاني' : '🔓 تفعيل المجاني', 'mode_free'), 
            Markup.button.callback(db.config.mode === 'PAID' ? '🔴 مدفوع' : '🔐 تفعيل المدفوع', 'mode_paid')
        ]);
    }

    ctx.replyWithHTML(
        `🔱 <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑷𝑹𝑶 VIP 1000</b> 🔱\n\n` +
        `👤 <b>الرتبة:</b> <code>${roleName}</code>\n` +
        `⚙️ <b>الجيش المتصل:</b> <code>${activeCount}/500</code>\n\n` +
        `<i>اختر الإجراء المناسب يا زعيم:</i>`,
        Markup.inlineKeyboard(buttons)
    );
});

bot.action('action_pair', (ctx) => {
    userStates[ctx.from.id] = { action: 'WAIT_PHONE' };
    ctx.replyWithHTML("📱 <b>أرسل رقم الهاتف (مع رمز الدولة):</b>\nمثال: 967733...");
});

bot.action('server_status', (ctx) => {
    const activeCount = Object.keys(activeSockets).length;
    ctx.replyWithHTML(`📊 <b>تقرير VIP 1000:</b>\n\n🟢 الجيش: ${activeCount}/500\n🟢 الوضع: ${db.config.mode}\n🟢 الدقة: 1000%`);
});

bot.action('mode_free', (ctx) => { if (ctx.from.id.toString() === OWNER_ID) { db.config.mode = 'FREE'; saveDB(); ctx.reply("🔓 تم تفعيل الوضع المجاني."); } });
bot.action('mode_paid', (ctx) => { if (ctx.from.id.toString() === OWNER_ID) { db.config.mode = 'PAID'; saveDB(); ctx.reply("🔐 تم تفعيل الوضع المدفوع."); } });

bot.action('action_add_vip', (ctx) => {
    userStates[ctx.from.id] = { action: 'WAIT_USER_ID' };
    ctx.replyWithHTML("🎫 <b>أرسل آيدي التلجرام للمشترك:</b>");
});

bot.action('action_add_reseller', (ctx) => {
    userStates[ctx.from.id] = { action: 'WAIT_RESELLER_ID' };
    ctx.replyWithHTML("💎 <b>أرسل آيدي التلجرام للموزع:</b>");
});

bot.on('text', async (ctx) => {
    const uid = ctx.from.id;
    const state = userStates[uid];
    if (!state) return;

    if (state.action === 'WAIT_PHONE') {
        const phone = ctx.message.text.replace(/[^0-9]/g, '');
        ctx.replyWithHTML("⏳ جاري استخراج كود VIP 1000...");
        const sId = `VIP1000_${Date.now()}`;
        db.sessions[sId] = { ownerTgId: uid, phone: phone };
        saveDB();
        await startWhatsAppSession(sId, phone, ctx);
        delete userStates[uid];
    } else if (state.action === 'WAIT_USER_ID') {
        db.users[ctx.message.text.trim()] = { role: 'USER', addedBy: uid, date: new Date().toISOString() };
        saveDB(); ctx.reply("✅ تم تفعيل العضوية."); delete userStates[uid];
    } else if (state.action === 'WAIT_RESELLER_ID') {
        db.users[ctx.message.text.trim()] = { role: 'RESELLER', addedBy: uid, date: new Date().toISOString() };
        saveDB(); ctx.reply("💎 تم تعيين الموزع."); delete userStates[uid];
    }
});

// ==========================================
// 🚀 إطلاق نظام القوة القصوى VIP 1000
// ==========================================
const init = async () => {
    const sDir = path.join(__dirname, 'sessions');
    if (!fs.existsSync(sDir)) fs.mkdirSync(sDir);
    const folders = fs.readdirSync(sDir).filter(f => fs.lstatSync(path.join(sDir, f)).isDirectory());
    for (const f of folders) { try { await startWhatsAppSession(f); await delay(1500); } catch (e) {} }
    bot.launch();
    console.log("🔥 TARZAN ULTRA VIP 1000 IS FULLY OPERATIONAL 🔥");
};

init();

process.on('uncaughtException', (err) => console.error(err.message));
process.on('unhandledRejection', (err) => console.error(err.message));
