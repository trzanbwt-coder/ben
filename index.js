/**
 * 👑 𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷 - 𝑬𝑫𝑰𝑻𝑰𝑶𝑵 𝑽𝑰𝑷 𝟐𝟎 𝑷𝑹𝑶 👑
 * النسخة الأقوى عالمياً: معالجة دفعات ضخمة، بلاغات متسلسلة، وفخامة لا تضاهى.
 * نظام مطور لدعم 500+ جلسة بدقة متناهية ودون أي أخطاء 😈
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
// 👑 محرك الفخامة VIP 20 (تنسيق ملكي فخم) 😈
// ==========================================
function formatLuxuriousMessage(title, content, footer = "𝑻𝑨𝑹𝒁𝑨𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷") {
    const frameTop    = `╔══════════════════════╗`;
    const frameBottom = `╚══════════════════════╝`;
    const separator   = `╟──────────────────────╢`;
    
    return `
${frameTop}
  👑 *${title}*
${separator}
${content.split('\n').map(line => `  ◈ ${line}`).join('\n')}
${separator}
  🔱 _${footer}_
${frameBottom}
`.trim();
}

// دالة سحب النصوص بدقة (تتعامل مع كل أنواع الرسائل)
function extractText(msg) {
    if (!msg.message) return '';
    const type = Object.keys(msg.message)[0];
    if (type === 'conversation') return msg.message.conversation;
    if (type === 'extendedTextMessage') return msg.message.extendedTextMessage.text;
    if (type === 'imageMessage' || type === 'videoMessage') return msg.message[type].caption;
    return '';
}

// ==========================================
// 🌐 خادم الويب (لضمان بقاء السيرفر حياً 24/7)
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('👑 TARZAN VIP 20 PRO IS FULLY ACTIVE 👑'));
app.listen(PORT, () => console.log(`🌐 VIP Server active on port ${PORT}`));

// ==========================================
// ⚙️ إعدادات التحكم والبيانات
// ==========================================
const TG_TOKEN = '8831436238:AAF9M5hGwNbQwfoLKOr_XYS2Qij6WOA7Krw'; 
const OWNER_ID = '8794826397'; 
const DB_FILE = './tarzan_master_db.json';

// تهيئة قاعدة البيانات مع الحفاظ على البيانات القديمة
let db = { config: { mode: 'FREE' }, users: {}, sessions: {} };
if (fs.existsSync(DB_FILE)) {
    try { db = { ...db, ...JSON.parse(fs.readFileSync(DB_FILE)) }; } 
    catch (e) { console.error("⚠️ فشل قراءة قاعدة البيانات، جاري البدء من جديد."); }
}
const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

const activeSockets = {}; 
const userStates = {}; 

// ==========================================
// 🔥 محرك الواتساب الجبار (معالجة ضخمة)
// ==========================================

async function startWhatsAppSession(sessionId, phoneNumber = null, tgContext = null) {
    const sessionDir = path.join(__dirname, 'sessions', sessionId);
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    const sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ["Windows", "Edge", "110.0.1587.41"],
        syncFullHistory: false, // لضمان خفة النظام مع 500+ جلسة
        shouldSyncHistoryMessage: () => false,
        generateHighQualityLinkPreview: true
    });

    activeSockets[sessionId] = sock;
    sock.ev.on('creds.update', saveCreds);

    // توليد كود الربط
    if (phoneNumber && !sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                if (tgContext) {
                    await tgContext.replyWithHTML(
                        `<b>🔱 كود تفعيل VIP 20 🔱</b>\n\n` +
                        `🔑 الكود: <code>${code}</code>\n\n` +
                        `<i>أدخل الكود في هاتفك الآن لربط القوة بالعظمة...</i>`
                    );
                }
            } catch (e) {
                if (tgContext) await tgContext.reply("❌ تعذر إصدار الكود، تأكد من الرقم.");
            }
        }, 3000);
    }

    // ⚔️ استقبال ومعالجة الأوامر (دقة VIP 20)
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        // البوت يستمع فقط لك "أنت" ومن خلال هاتفك المرتبط
        if (!msg.message || !msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = extractText(msg).trim();
        if (!body) return;

        // 💀 أمر المعالجة (.ben) - الاستراتيجية الجديدة
        if (body.startsWith('.ben ')) {
            const target = body.split(' ')[1];
            if (!target) return;
            const targetJid = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            
            // إشعار البدء الفخم
            const startContent = `🎯 الـهـدف: ${target}\n⚙️ الـنـوع: معالجة بلاغات VIP\n⏳ الـحـالـة: جاري إرسال 10 بلاغات لكل حساب أولاً... ⚔️`;
            await sock.sendMessage(from, { text: formatLuxuriousMessage('بـدء الـتـدمـيـر', startContent) }, { quoted: msg });

            let totalReports = 0;
            let totalBlocks = 0;
            const allSessions = Object.keys(activeSockets);

            for (const sId of allSessions) {
                const s = activeSockets[sId];
                try {
                    // المرحلة الأولى: 10 بلاغات متتالية (لتشويه سمعة الرقم)
                    for (let i = 0; i < 10; i++) {
                        if (typeof s.reportSpam === 'function') {
                            await s.reportSpam(targetJid);
                            totalReports++;
                        }
                        await delay(250); // سرعة قصوى مع أمان
                    }
                    // المرحلة الثانية: الحظر النهائي بعد البلاغات
                    await s.updateBlockStatus(targetJid, 'block');
                    totalBlocks++;
                } catch (e) {}
            }
            
            // إشعار الانتهاء الفخم
            const endContent = `📈 إجـمالي الـبـلاغـات: ${totalReports}\n🚫 عـملـيـات الـحـظر: ${totalBlocks}\n🔗 جـلـسات مـشـاركـة: ${allSessions.length}\n\n*تـم سـحـق الـهـدف بـنـجـاح تـحـت ظـلال VIP 20* 👑`;
            await sock.sendMessage(from, { text: formatLuxuriousMessage('اكـتـمـال الـمـهـمة', endContent) }, { quoted: msg });
        }

        // 📢 أمر المتابعة (.متابعه)
        else if (body.startsWith('.متابعه ') || body.startsWith('.متابعة ')) {
            const link = body.split(' ')[1];
            if (!link || !link.includes('whatsapp.com/channel/')) return;
            const inviteCode = link.split('channel/')[1].split('/')[0];
            
            await sock.sendMessage(from, { text: formatLuxuriousMessage('دوران الـدعـم', `⏳ جاري توجيه الجيش للمتابعة الجماعية... 🚀`) }, { quoted: msg });

            let count = 0;
            for (const sId in activeSockets) {
                try {
                    const meta = await activeSockets[sId].newsletterMetadata("invite", inviteCode);
                    if (meta?.id) {
                        await activeSockets[sId].newsletterFollow(meta.id);
                        count++;
                        await delay(500);
                    }
                } catch (e) {}
            }
            
            const supportContent = `📊 مـتـابـعـات جـديـدة: ${count}\n✨ الـحـالـة: تـم الـدعـم بـنـجـاح مـطلق\n\n_بصمة طرزان لا تـمحـى_ 🔱`;
            await sock.sendMessage(from, { text: formatLuxuriousMessage('نـجـاح الـدعم', supportContent) }, { quoted: msg });
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
            console.log(`✅ [VIP 20 ACTIVE] ID: ${sessionId}`);
            
            if (!db.sessions[sessionId]) db.sessions[sessionId] = {};
            if (!db.sessions[sessionId].welcomeSent) {
                try {
                    const selfId = jidNormalizedUser(sock.user.id);
                    const welcomeTxt = `أهـلاً بـك فـي عـرش VIP 20.\n\nتـم تـفعيل الـقـوة الـعظمى لـهـذا الـرقـم.\nالـنـظام الآن يـسـتـمع لأوامـرك بـدقة.\n\n📝 *أوامـر الـعـظـمة:*\n❖ .ben [الـرقـم]\n❖ .مـتابعه [الـرابط]`;
                    
                    await sock.sendMessage(selfId, { text: formatLuxuriousMessage('تـنـشـيـط الـنـظـام', welcomeTxt) });
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
        return ctx.replyWithHTML("❌ <b>النظام في وضع VIP 20 المدفوع</b>\nيرجى الاشتراك لتفعيل العظمة.");
    }

    const activeCount = Object.keys(activeSockets).length;
    let buttons = [
        [Markup.button.callback('🔗 ربط وتفعيل VIP 20', 'action_pair')],
        [Markup.button.callback('📊 حالة الجيش', 'server_status')]
    ];

    if (role === 'OWNER') {
        buttons.push([Markup.button.callback('🎖️ تعيين موزع جديد', 'action_add_reseller')]);
    }

    ctx.replyWithHTML(
        `🔱 <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑷𝑹𝑶 VIP 20</b> 🔱\n\n` +
        `👤 <b>الرتبة:</b> <code>${role}</code>\n` +
        `⚙️ <b>الأرقام النشطة:</b> <code>${activeCount}/500</code>\n\n` +
        `<i>اختر إجراءك الملكي يا زعيم:</i>`,
        Markup.inlineKeyboard(buttons)
    );
});

bot.action('action_pair', (ctx) => {
    userStates[ctx.from.id] = { action: 'WAIT_PHONE' };
    ctx.replyWithHTML("📱 <b>أرسل رقم الهاتف مع رمز الدولة:</b>\nمثال: 967733...");
});

bot.action('server_status', (ctx) => {
    const activeCount = Object.keys(activeSockets).length;
    ctx.replyWithHTML(
        `📊 <b>تقرير الحالة VIP 20:</b>\n\n` +
        `🟢 <b>الخادم:</b> مستقر (Render PRO)\n` +
        `🟢 <b>الجيش المتصل:</b> ${activeCount} رقم\n` +
        `🟢 <b>الدقة:</b> 100%`
    );
});

bot.on('text', async (ctx) => {
    const uid = ctx.from.id;
    const state = userStates[uid];
    if (!state) return;

    const text = ctx.message.text.trim();

    if (state.action === 'WAIT_PHONE') {
        const phone = text.replace(/[^0-9]/g, '');
        if (phone.length < 10) return ctx.replyWithHTML("❌ الرقم غير صحيح.");
        
        ctx.replyWithHTML("⏳ جاري تجهيز محرك VIP 20 لاستخراج الكود...");
        const sId = `VIP20_${Date.now()}`;
        db.sessions[sId] = { ownerTgId: uid, phone: phone };
        saveDB();
        
        await startWhatsAppSession(sId, phone, ctx);
        delete userStates[uid];
    }
});

// ==========================================
// 🚀 إطلاق القوة العظمى
// ==========================================
const init = async () => {
    const sDir = path.join(__dirname, 'sessions');
    if (!fs.existsSync(sDir)) fs.mkdirSync(sDir);
    
    const folders = fs.readdirSync(sDir).filter(f => fs.lstatSync(path.join(sDir, f)).isDirectory());
    for (const f of folders) {
        try { await startWhatsAppSession(f); await delay(1200); } catch (e) {}
    }
    
    bot.launch();
    console.log("🔥 TARZAN VIP 20 PRO IS FULLY ARMED AND READY 🔥");
};

init();

process.on('uncaughtException', (err) => console.error(err.message));
process.on('unhandledRejection', (err) => console.error(err.message));
