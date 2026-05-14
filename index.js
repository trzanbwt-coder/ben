/**
 * 👑 متجر الواقدي للخدمات الإلكترونية - نسخة VIP 👑
 * نظام الإدارة المتكامل (Telegram + WhatsApp) + تخطي حظر الأكواد (Edge Edition)
 */

const { Telegraf, Markup } = require('telegraf');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    makeCacheableSignalKeyStore,
    delay
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const express = require('express');

// ==========================================
// ⚙️ إعدادات النظام الأساسية
// ==========================================
const TG_TOKEN = '8831436238:AAF9M5hGwNbQwfoLKOr_XYS2Qij6WOA7Krw'; 
const ADMIN_ID = '8794826397'; 

const PORT = process.env.PORT || 3000;
const SESSION_DIR = path.join(__dirname, 'waqedi_session');
const DB_FILE = path.join(__dirname, 'waqedi_db.json');

// ==========================================
// 🗄️ قاعدة البيانات المحلية
// ==========================================
let db = {
    settings: { botActive: true },
    customers: {}, 
    stats: { messagesReceived: 0, ordersPlaced: 0 }
};

if (fs.existsSync(DB_FILE)) {
    try { db = Object.assign(db, JSON.parse(fs.readFileSync(DB_FILE))); } 
    catch (e) { console.error("⚠️ خطأ في قراءة قاعدة البيانات، سيتم إنشاء واحدة جديدة."); }
}
const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

// ==========================================
// 🌐 خادم الويب (لإبقاء السيرفر نشطاً على Render)
// ==========================================
const app = express();
app.get('/', (req, res) => res.send('👑 متجر الواقدي للخدمات الإلكترونية VIP يعمل بنجاح (EDGE MODE) 👑'));
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));

// ==========================================
// 📱 تهيئة بوت التلجرام (لوحة التحكم)
// ==========================================
const tgBot = new Telegraf(TG_TOKEN);
let adminState = { action: null }; 

// ==========================================
// 🔥 محرك الواتساب (متجر الواقدي - بصمة Edge)
// ==========================================
let waSock = null;

async function startWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

    waSock = makeWASocket({
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) 
        },
        logger: pino({ level: 'silent' }),
        // 🛡️ التعديل السري: محاكاة Edge على ويندوز لتخطي حظر الكود
        browser: ["Windows", "Edge", "110.0.1587.41"], 
        printQRInTerminal: false,
        syncFullHistory: false,
        markOnlineOnConnect: false
    });

    waSock.ev.on('creds.update', saveCreds);

    waSock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            if (statusCode === DisconnectReason.loggedOut) {
                fs.rmSync(SESSION_DIR, { recursive: true, force: true });
                waSock = null;
                tgBot.telegram.sendMessage(ADMIN_ID, "⚠️ تم تسجيل الخروج من الواتساب! يرجى إعادة الربط عبر اللوحة.");
            } else {
                setTimeout(startWhatsApp, 4000); // تأخير لإعادة الاتصال بأمان
            }
        } else if (connection === 'open') {
            tgBot.telegram.sendMessage(ADMIN_ID, "✅ متجر الواقدي (واتساب) متصل كمتصفح Edge وجاهز للعمل!");
        }
    });

    waSock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        if (!db.settings.botActive) return;

        const sender = msg.key.remoteJid;
        if (sender.includes('@g.us')) return; // تجاهل الجروبات

        db.stats.messagesReceived++;
        const pushName = msg.pushName || 'عميلنا العزيز';
        
        if (!db.customers[sender]) {
            db.customers[sender] = { name: pushName, firstVisit: new Date().toISOString(), state: 'IDLE' };
            saveDB();
        }

        const text = (msg.message.conversation || 
                      msg.message.extendedTextMessage?.text || 
                      msg.message.listResponseMessage?.title || 
                      msg.message.buttonsResponseMessage?.selectedDisplayText || '').trim();

        await handleCustomerMessage(sender, text, pushName, msg);
    });
}

// ==========================================
// 🤖 منطق التعامل مع رسائل العملاء (المتجر)
// ==========================================
async function handleCustomerMessage(sender, text, pushName, originalMsg) {
    const userState = db.customers[sender].state;

    // فتح القائمة الرئيسية
    if (['مرحبا', 'السلام عليكم', 'هلا', 'خدمات', 'القائمة'].includes(text.toLowerCase())) {
        db.customers[sender].state = 'IDLE';
        const menuSections = [
            {
                title: "💎 خدمات السوشيال ميديا",
                rows: [
                    {title: "🚀 زيادة متابعين تيك توك", rowId: "srv_tiktok", description: "متابعين حقيقيين وسريعين"},
                    {title: "📸 زيادة متابعين انستقرام", rowId: "srv_insta", description: "عرب وأجانب بضمان"}
                ]
            },
            {
                title: "🎮 شحن ألعاب",
                rows: [
                    {title: "🔥 شحن شدات ببجي", rowId: "srv_pubg", description: "أسعار منافسة وتسليم فوري"}
                ]
            },
            {
                title: "🛠️ الدعم والمساعدة",
                rows: [
                    {title: "👨‍💻 التحدث مع الإدارة", rowId: "srv_admin", description: "للاستفسارات والمشاكل"},
                    {title: "💳 طرق الدفع", rowId: "srv_payment", description: "الحسابات البنكية المتاحة"}
                ]
            }
        ];

        const listMsg = {
            text: `أهلاً بك يا *${pushName}* في 👑 *متجر الواقدي للخدمات الإلكترونية VIP* 👑\n\nنحن هنا لتلبية احتياجاتك الرقمية.\nيرجى اختيار الخدمة المطلوبة:`,
            footer: "مؤسسة الواقدي © 2026",
            title: "قائمة الخدمات 📋",
            buttonText: "عرض الخدمات 👆",
            sections: menuSections
        };

        await waSock.sendMessage(sender, listMsg);
        return;
    }

    // تفاعلات الأقسام
    if (text === '🚀 زيادة متابعين تيك توك') {
        await waSock.sendMessage(sender, { text: "📌 *تيك توك:*\n- 1000 متابع = 5$\n\nأرسل رابط حسابك الآن:" });
        db.customers[sender].state = 'WAITING_TIKTOK_LINK'; saveDB(); return;
    }
    
    if (text === '🔥 شحن شدات ببجي') {
        await waSock.sendMessage(sender, { text: "📌 *ببجي:*\n- 325 شدة = 4$\n\nأرسل الـ ID الخاص بك:" });
        db.customers[sender].state = 'WAITING_PUBG_ID'; saveDB(); return;
    }

    if (text === '💳 طرق الدفع') {
        await waSock.sendMessage(sender, { text: "💳 *طرق الدفع:*\n1. تحويل بنكي (الراجحي، الأهلي)\n2. STC Pay\n3. باينانس USDT\n\n(للعودة أرسل 'قائمة')" }); return;
    }

    if (text === '👨‍💻 التحدث مع الإدارة') {
        await waSock.sendMessage(sender, { text: "تم تحويلك للإدارة. ⏳\nيرجى كتابة رسالتك وسنرد عليك قريباً." });
        db.customers[sender].state = 'CHATTING_WITH_ADMIN'; saveDB();
        tgBot.telegram.sendMessage(ADMIN_ID, `🔔 *طلب محادثة جديد*\nالعميل: ${pushName}\nالرقم: ${sender.split('@')[0]}`); return;
    }
    
    // التعامل مع مدخلات العملاء (روابط، IDs، شات)
    if (userState === 'WAITING_TIKTOK_LINK') {
        await waSock.sendMessage(sender, { text: "✅ تم استلام الرابط.\nجاري التجهيز... الرجاء الانتظار لتحويل الإيصال.\n(للعودة أرسل 'قائمة')" });
        db.customers[sender].state = 'IDLE'; db.stats.ordersPlaced++; saveDB();
        tgBot.telegram.sendMessage(ADMIN_ID, `🛒 *طلب تيك توك*\nالعميل: ${pushName}\nالرابط: ${text}`); return;
    }

    if (userState === 'WAITING_PUBG_ID') {
        await waSock.sendMessage(sender, { text: `✅ تم استلام الـ ID: *${text}*\nجاري التجهيز...\n(للعودة أرسل 'قائمة')` });
        db.customers[sender].state = 'IDLE'; db.stats.ordersPlaced++; saveDB();
        tgBot.telegram.sendMessage(ADMIN_ID, `🎮 *طلب ببجي*\nالعميل: ${pushName}\nالـ ID: ${text}`); return;
    }

    if (userState === 'CHATTING_WITH_ADMIN') {
        tgBot.telegram.sendMessage(ADMIN_ID, `💬 *رسالة من ${pushName}:*\n${text}\n\n---\nللرد:\n\`/رد ${sender.split('@')[0]} النص\``, {parse_mode: 'Markdown'}); return;
    }

    // الرد الافتراضي
    if (userState === 'IDLE') {
        await waSock.sendMessage(sender, {
            name: 'عذراً، لم أفهم طلبك. اختر إجراء سريع 👇',
            values: ['القائمة', '👨‍💻 التحدث مع الإدارة'],
            selectableCount: 1
        });
    }
}

// ==========================================
// 🛠️ لوحة تحكم التلجرام للمدير
// ==========================================
tgBot.use((ctx, next) => {
    // حماية اللوحة لكي لا يستخدمها أحد غيرك
    if (ctx.from && ctx.from.id.toString() !== ADMIN_ID) return ctx.reply("⛔ اللوحة للإدارة فقط.");
    return next();
});

tgBot.start((ctx) => { adminState.action = null; sendAdminMenu(ctx); });

function sendAdminMenu(ctx) {
    const statusText = db.settings.botActive ? '🟢 البوت يعمل' : '🔴 البوت متوقف';
    const msg = `👑 *لوحة متجر الواقدي VIP* 👑\n\n📊 *الإحصائيات:*\n- العملاء المسجلين: ${Object.keys(db.customers).length}\n- الطلبات الجديدة: ${db.stats.ordersPlaced}\n\n⚙️ *الحالة:* ${statusText}\n💻 *متصفح الربط:* Edge 110`;

    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔗 ربط الرقم (Pair Code)', 'admin_pair')],
        [Markup.button.callback(db.settings.botActive ? '⏸️ إيقاف المتجر' : '▶️ تشغيل المتجر', 'admin_toggle_bot')],
        [Markup.button.callback('📢 رسالة للكل', 'admin_broadcast')],
        [Markup.button.callback('🔄 تحديث الإحصائيات', 'admin_refresh')]
    ]);

    if (ctx.updateType === 'callback_query') ctx.editMessageText(msg, { parse_mode: 'Markdown', ...keyboard }).catch(()=>{});
    else ctx.reply(msg, { parse_mode: 'Markdown', ...keyboard });
}

tgBot.action('admin_refresh', (ctx) => { ctx.answerCbQuery(); sendAdminMenu(ctx); });

tgBot.action('admin_toggle_bot', (ctx) => {
    db.settings.botActive = !db.settings.botActive; saveDB();
    ctx.answerCbQuery('تم التغيير'); sendAdminMenu(ctx);
});

tgBot.action('admin_pair', (ctx) => {
    ctx.answerCbQuery();
    if (waSock && waSock.authState && waSock.authState.creds && waSock.authState.creds.registered) {
        return ctx.reply("⚠️ هناك رقم مرتبط بالفعل. سجل الخروج من تطبيق الواتساب أولاً لربط رقم جديد.");
    }
    adminState.action = 'WAITING_PHONE';
    ctx.reply("📱 *أرسل رقم الواتساب للربط:*\n(أرسل الرقم بدون علامة + أو أصفار البداية، مثال: 966500000000)", {parse_mode: 'Markdown'});
});

tgBot.action('admin_broadcast', (ctx) => {
    ctx.answerCbQuery(); adminState.action = 'WAITING_BROADCAST';
    ctx.reply("📢 *إرسال رسالة للكل:*\nاكتب الرسالة (أو أرسل كلمة 'الغاء' للتراجع)", {parse_mode: 'Markdown'});
});

tgBot.on('text', async (ctx) => {
    const text = ctx.message.text.trim();

    // 📩 أمر الرد المباشر من التلجرام إلى الواتساب
    if (text.startsWith('/رد ')) {
        if (!waSock) return ctx.reply("❌ الواتساب غير متصل.");
        const parts = text.split(' ');
        if (parts.length < 3) return ctx.reply("⚠️ الاستخدام الصحيح: `/رد رقم_العميل رسالتك`", {parse_mode:'Markdown'});
        
        try {
            await waSock.sendMessage(`${parts[1]}@s.whatsapp.net`, { text: `👨‍💻 *رد الإدارة:*\n\n${parts.slice(2).join(' ')}` });
            ctx.reply("✅ تم إرسال الرد بنجاح.");
        } catch (e) { ctx.reply("❌ فشل الإرسال، تأكد من الرقم."); }
        return;
    }

    // 📱 استقبال رقم الهاتف لطلب الكود
    if (adminState.action === 'WAITING_PHONE') {
        let phone = text.replace(/[^0-9]/g, '');
        if (!phone) return ctx.reply("❌ يرجى إرسال أرقام فقط.");
        
        ctx.reply("⏳ جاري الطلب من سيرفرات واتساب بهوية Edge لضمان القبول...");
        
        try {
            if (waSock) {
                 setTimeout(async () => {
                    try {
                        let code = await waSock.requestPairingCode(phone);
                        ctx.reply(`👑 *كود الربط الخاص بك هو:* \n\n\`${code}\`\n\nأدخله الآن في تطبيق الواتساب (الأجهزة المرتبطة > ربط برقم الهاتف).`, {parse_mode: 'Markdown'});
                    } catch (codeError) {
                        console.error("Pairing Code Error:", codeError);
                        ctx.reply(`❌ تم رفض الطلب.\nالسبب: ${codeError.message}\nيرجى التأكد من الرقم، أو جرب رقماً آخر.`);
                    }
                 }, 2500); 
            } else {
                 ctx.reply("⚠️ المحرك غير جاهز. انتظر ثواني وحاول مجدداً.");
            }
        } catch (e) { 
            ctx.reply(`❌ خطأ عام: ${e.message}`); 
        }
        adminState.action = null;
    } 
    // 📢 استقبال رسالة الإذاعة (Broadcast)
    else if (adminState.action === 'WAITING_BROADCAST') {
        if (text === 'الغاء') { adminState.action = null; return ctx.reply("✅ تم إلغاء الإرسال."); }
        if (!waSock) return ctx.reply("❌ الواتساب غير متصل.");
        
        const customers = Object.keys(db.customers);
        if (customers.length === 0) return ctx.reply("⚠️ لا يوجد عملاء في قاعدة البيانات.");
        
        ctx.reply(`⏳ جاري الإرسال لـ ${customers.length} عميل... الرجاء الانتظار.`);
        let successCount = 0;
        
        for (const jid of customers) {
            try { 
                await waSock.sendMessage(jid, { text: `📢 *إعلان من متجر الواقدي:*\n\n${text}` }); 
                successCount++; 
                await delay(1200); // تأخير مهم لتجنب حظر الواتساب
            } catch (e) {}
        }
        ctx.reply(`✅ *اكتمل الإرسال!*\nتم الوصول لـ ${successCount} عميل بنجاح.`, {parse_mode: 'Markdown'});
        adminState.action = null;
    }
});

// ==========================================
// 🚀 بدء التشغيل
// ==========================================
async function initSystem() {
    console.log("🔥 Starting Waqedi Store VIP System...");
    tgBot.launch().catch(err => console.error("Telegram Launch Error:", err));
    console.log("✅ لوحة تحكم التلجرام تعمل.");
    await startWhatsApp();
}

initSystem();

// معالجة الأخطاء الطارئة لضمان عدم توقف السيرفر
process.on('uncaughtException', (err) => console.log('Uncaught Error:', err.message));
process.on('unhandledRejection', (err) => console.log('Unhandled Rejection:', err.message));
