/**
 * 👑 𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷 - 𝑬𝑫𝑰𝑻𝑰𝑶𝑵 𝑽𝑰𝑷 𝟑𝟎 👑
 * النسخة المدمرة: بلاغات أرقام، مجموعات، وقنوات مع نظام إدارة متكامل.
 * تطوير شامل وفخامة ملكية بدون حذف أي ميزة سابقة 😈
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
// 👑 محرك الفخامة VIP 30 (تنسيق ملكي جبار) 😈
// ==========================================
function formatLuxuriousMessage(title, content) {
    const frameTop    = `╔══════════ ≪ 👑 ≫ ══════════╗`;
    const frameBottom = `╚══════════ ≪ 👑 ≫ ══════════╝`;
    const separator   = `╟────────────────────────────╢`;
    const bullet      = `◈`;
    
    let formattedContent = content.split('\n').map(line => `   ${bullet} ${line}`).join('\n');
    
    return `
${frameTop}
   ✨ *${title}*
${separator}

${formattedContent}

${separator}
   🔱 _𝑻𝑨𝑹𝒁𝑨𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷 𝟑𝟎_
${frameBottom}
`.trim();
}

// دالة استخراج النصوص والروابط
function extractText(msg) {
    if (!msg.message) return '';
    const type = Object.keys(msg.message)[0];
    if (type === 'conversation') return msg.message.conversation;
    if (type === 'extendedTextMessage') return msg.message.extendedTextMessage.text;
    if (msg.message[type] && msg.message[type].caption) return msg.message[type].caption;
    return '';
}

// ==========================================
// 🌐 خادم الويب (Stay-Alive)
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('👑 TARZAN VIP 30 PRO SYSTEM ACTIVE 👑'));
app.listen(PORT, () => console.log(`🌐 Server VIP 30 active on port ${PORT}`));

// ==========================================
// ⚙️ إعدادات التحكم وقاعدة البيانات
// ==========================================
const TG_TOKEN = '8831436238:AAF9M5hGwNbQwfoLKOr_XYS2Qij6WOA7Krw'; 
const OWNER_ID = '8794826397'; 
const DB_FILE = './tarzan_master_db.json';

let db = { config: { mode: 'FREE' }, users: {}, sessions: {} };
if (fs.existsSync(DB_FILE)) {
    try { db = { ...db, ...JSON.parse(fs.readFileSync(DB_FILE)) }; } 
    catch (e) { console.error("⚠️ خطأ قاعدة البيانات."); }
}
const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

const activeSockets = {}; 
const userStates = {}; 

// ==========================================
// 🔥 محرك الواتساب VIP 30 (الهجوم الشامل)
// ==========================================

async function startWhatsAppSession(sessionId, phoneNumber = null, tgContext = null) {
    const sessionDir = path.join(__dirname, 'sessions', sessionId);
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    const sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ["Windows", "Chrome", "120.0.0.0"],
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
                    await tgContext.replyWithHTML(`🔱 <b>كود VIP 30 المستخرج:</b>\n\n🔑 الكود: <code>${code}</code>`);
                }
            } catch (e) { if (tgContext) await tgContext.reply("❌ فشل إصدار الكود."); }
        }, 3000);
    }

    // ⚔️ معالجة الأوامر (المدمرة VIP 30)
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || !msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = extractText(msg).trim();
        if (!body) return;

        // 💀 أمر المعالجة (.ben) - يدعم الأرقام، المجموعات، والقنوات
        if (body.startsWith('.ben ')) {
            const input = body.split(' ')[1];
            if (!input) return;

            let targetJid = '';
            let targetType = 'رقم هاتف';

            // تحديد نوع الهدف
            if (input.includes('chat.whatsapp.com/')) {
                targetType = 'مجموعة (رابط)';
                const code = input.split('chat.whatsapp.com/')[1];
                try { targetJid = await sock.groupAcceptInvite(code); } catch(e) { targetJid = code; }
            } else if (input.includes('whatsapp.com/channel/')) {
                targetType = 'قناة (رابط)';
                targetJid = input.split('channel/')[1].split('/')[0];
            } else {
                targetJid = input.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }
            
            const startContent = `الـهـدف: ${input}\nالـنـوع: ${targetType}\nالـقـوة: VIP 30\n\n_جاري إرسال البلاغات الحقيقية من كافة الأنظمة..._ ⚔️`;
            await sock.sendMessage(from, { text: formatLuxuriousMessage('بـدء الـسـحـق الـشـامـل', startContent) }, { quoted: msg });

            let reports = 0;
            let actions = 0;
            const sessions = Object.keys(activeSockets);

            for (const sId of sessions) {
                const s = activeSockets[sId];
                try {
                    if (targetType.includes('رقم')) {
                        // هجوم الأرقام: 10 بلاغات ثم حظر
                        for (let i = 0; i < 10; i++) {
                            await s.reportSpam(targetJid);
                            reports++;
                            await delay(200);
                        }
                        await s.updateBlockStatus(targetJid, 'block');
                        actions++;
                    } else if (targetType.includes('مجموعة')) {
                        // هجوم المجموعات: دخول، بلاغ، مغادرة
                        const gJid = targetJid.includes('@g.us') ? targetJid : (await s.groupAcceptInvite(targetJid));
                        await s.reportSpam(gJid); 
                        reports++;
                        await s.groupLeave(gJid);
                        actions++;
                    } else if (targetType.includes('قناة')) {
                        // هجوم القنوات: بلاغ مكثف
                        const meta = await s.newsletterMetadata("invite", targetJid);
                        if (meta?.id) {
                            await s.reportSpam(meta.id); 
                            reports++;
                            actions++;
                        }
                    }
                } catch (e) {}
            }
            
            const endContent = `إجـمالي الـبـلاغـات: ${reports}\nالـعملـيات الـناجـحة: ${actions}\nالـجيش الـمشارك: ${sessions.length}\n\n*تـم الانـتـهاء مـن تـدمـيـر الـهـدف بـكل فـخامة* 👑`;
            await sock.sendMessage(from, { text: formatLuxuriousMessage('اكـتـمـال الإبـادة', endContent) }, { quoted: msg });
        }

        // 📢 أمر المتابعة (.متابعه)
        else if (body.startsWith('.متابعه ') || body.startsWith('.متابعة ')) {
            const link = body.split(' ')[1];
            if (!link || !link.includes('whatsapp.com/channel/')) return;
            const inviteCode = link.split('channel/')[1].split('/')[0];
            
            await sock.sendMessage(from, { text: formatLuxuriousMessage('دوران الـدعـم', `⏳ جاري تفعيل المتابعة من كافة الحسابات المتصلة...`) }, { quoted: msg });

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
            await sock.sendMessage(from, { text: formatLuxuriousMessage('اكـتـمـل الـدعـم', `📈 متابعات جديدة: ${count}\n_بصمة طرزان تم وضعها بنجاح_ 👑`) }, { quoted: msg });
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
            } else { setTimeout(() => startWhatsAppSession(sessionId), 5000); }
        } else if (connection === 'open') {
            console.log(`✅ [VIP 30 READY] ID: ${sessionId}`);
            if (!db.sessions[sessionId]) db.sessions[sessionId] = {};
            if (!db.sessions[sessionId].welcomeSent) {
                try {
                    const selfId = jidNormalizedUser(sock.user.id);
                    const welcomeTxt = `أهـلاً بـك فـي عـالـم الـعـظـمة VIP 30.\n\nتـم تـنـشيط الـقـوة الـمـدمرة لـهذا الـرقم.\n\n📝 *الأوامـر:* \n❖ .ben [رقم/رابط مجموعة/رابط قناة]\n❖ .متابعه [رابط قناة]`;
                    await sock.sendMessage(selfId, { text: formatLuxuriousMessage('تـفعيل الـنظام الـملكي', welcomeTxt) });
                    db.sessions[sessionId].welcomeSent = true; saveDB();
                } catch (e) {}
            }
        }
    });
}

// ==========================================
// 📱 لوحة تحكم Telegram (كاملة الميزات)
// ==========================================
const bot = new Telegraf(TG_TOKEN);

bot.start((ctx) => {
    const uid = ctx.from.id.toString();
    const isOwner = uid === OWNER_ID;
    const user = db.users[uid];
    const role = isOwner ? 'OWNER' : (user ? user.role : 'GUEST');

    if (db.config.mode === 'PAID' && role === 'GUEST') {
        return ctx.replyWithHTML("❌ <b>النظام حالياً في وضع VIP</b>\nيرجى مراجعة الموزع للاشتراك.");
    }

    const roleName = { 'OWNER': '👑 المالك الرئيسي', 'RESELLER': '💎 موزع معتمد', 'USER': '👤 عضو VIP', 'GUEST': '🆓 مستخدم عادي' }[role];
    
    let buttons = [
        [Markup.button.callback('🔗 ربط حساب VIP 30', 'action_pair')],
        [Markup.button.callback('📊 حالة الجيش', 'server_status')]
    ];
    if (role === 'OWNER' || role === 'RESELLER') buttons.push([Markup.button.callback('🎫 تفعيل عضوية', 'action_add_vip')]);
    if (role === 'OWNER') {
        buttons.push([Markup.button.callback('🎖️ تعيين موزع', 'action_add_reseller')]);
        buttons.push([
            Markup.button.callback(db.config.mode === 'FREE' ? '🟢 الوضع المجاني' : '🔓 تفعيل المجاني', 'mode_free'), 
            Markup.button.callback(db.config.mode === 'PAID' ? '🔴 الوضع المدفوع' : '🔐 تفعيل المدفوع', 'mode_paid')
        ]);
    }

    ctx.replyWithHTML(
        `🔱 <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑷𝑹𝑶 VIP 30</b> 🔱\n\n` +
        `👤 <b>الرتبة:</b> <code>${roleName}</code>\n` +
        `⚙️ <b>الأرقام المتصلة:</b> <code>${Object.keys(activeSockets).length}/500</code>\n\n` +
        `<i>اختر إجراءك من الأسفل:</i>`,
        Markup.inlineKeyboard(buttons)
    );
});

bot.action('action_pair', (ctx) => {
    userStates[ctx.from.id] = { action: 'WAIT_PHONE' };
    ctx.replyWithHTML("📱 <b>أرسل رقم الهاتف (مع رمز الدولة):</b>");
});

bot.action('server_status', (ctx) => {
    ctx.replyWithHTML(`📊 <b>تقرير VIP 30:</b>\n\n🟢 الجيش: ${Object.keys(activeSockets).length}\n🟢 الوضع: ${db.config.mode}\n🟢 الخادم: Render Pro`);
});

bot.action('mode_free', (ctx) => { if (ctx.from.id.toString() === OWNER_ID) { db.config.mode = 'FREE'; saveDB(); ctx.reply("🔓 تم تفعيل الوضع المجاني."); } });
bot.action('mode_paid', (ctx) => { if (ctx.from.id.toString() === OWNER_ID) { db.config.mode = 'PAID'; saveDB(); ctx.reply("🔐 تم تفعيل الوضع المدفوع."); } });

bot.on('text', async (ctx) => {
    const uid = ctx.from.id;
    const state = userStates[uid];
    if (!state) return;

    if (state.action === 'WAIT_PHONE') {
        const phone = ctx.message.text.replace(/[^0-9]/g, '');
        ctx.replyWithHTML("⏳ جاري استخراج كود VIP 30...");
        const sId = `VIP30_${Date.now()}`;
        db.sessions[sId] = { ownerTgId: uid, phone: phone }; saveDB();
        await startWhatsAppSession(sId, phone, ctx);
        delete userStates[uid];
    }
});

// ==========================================
// 🚀 إطلاق القوة العظمى VIP 30
// ==========================================
const init = async () => {
    const sDir = path.join(__dirname, 'sessions');
    if (!fs.existsSync(sDir)) fs.mkdirSync(sDir);
    const folders = fs.readdirSync(sDir).filter(f => fs.lstatSync(path.join(sDir, f)).isDirectory());
    for (const f of folders) { try { await startWhatsAppSession(f); await delay(1000); } catch (e) {} }
    bot.launch();
    console.log("🔥 TARZAN VIP 30 PRO FULLY OPERATIONAL 🔥");
};

init();

process.on('uncaughtException', (err) => console.error(err.message));
process.on('unhandledRejection', (err) => console.error(err.message));
