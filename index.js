/**
 * 👑 𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷 - 𝑷𝑹𝑶 𝑬𝑫𝑰𝑻𝑰𝑶𝑵 𝑽𝑰𝑷 𝟏𝟎𝟎𝟎 👑
 * نظام الإدارة الذكية والربط المتقدم - نسخة مخصصة ومنقحة
 * تم الإصلاح: التنفيذ الحقيقي، عداد غير صفري، محاكاة مايكروسوفت إيدج.
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
// 🔱 محرك التنسيق والجماليات 🔱
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
// 🌐 خادم الويب (لضمان استمرار السيرفر 24/7)
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('👑 TARZAN PRO SYSTEM ACTIVE 👑'));
app.listen(PORT);

// ==========================================
// ⚙️ إعدادات التحكم وقاعدة البيانات
// ==========================================
const TG_TOKEN = '8831436238:AAF9M5hGwNbQwfoLKOr_XYS2Qij6WOA7Krw'; 
const OWNER_ID = '8794826397'; 
const DB_FILE = './tarzan_master_db.json';

let db = { config: { mode: 'FREE' }, users: {}, sessions: {} };
if (fs.existsSync(DB_FILE)) {
    try { db = { ...db, ...JSON.parse(fs.readFileSync(DB_FILE)) }; } 
    catch (e) { console.error("⚠️ خطأ في قاعدة البيانات."); }
}
const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

const activeSockets = {}; 
const userStates = {}; 

// ==========================================
// 🔥 محرك الواتساب (الإبادة الحقيقية)
// ==========================================

async function startWhatsAppSession(sessionId, phoneNumber = null, tgContext = null) {
    const sessionDir = path.join(__dirname, 'sessions', sessionId);
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    const sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        // 💻 محاكاة Microsoft Edge على Windows لضمان قبول طلب الكود فوراً
        browser: ["Windows", "Edge", "110.0.1587.41"],
        syncFullHistory: false
    });

    activeSockets[sessionId] = sock;
    sock.ev.on('creds.update', saveCreds);

    // 🔑 طلب كود الربط بنظام Edge
    if (phoneNumber && !sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                if (tgContext) {
                    await tgContext.replyWithHTML(
                        `<b>🔱 تم استخراج كود VIP بنجاح 🔱</b>\n\n` +
                        `🔑 الكود: <code>${code}</code>\n\n` +
                        `💻 النظام: Microsoft Edge (Windows)\n\n` +
                        `😈 <i>أدخل الكود في هاتفك الآن لتفعيل الجيش...</i>`
                    );
                }
            } catch (e) {
                if (tgContext) await tgContext.reply("❌ فشل استخراج الكود، حاول مرة أخرى.");
            }
        }, 3000);
    }

    // ⚔️ المعالجة الحقيقية (Anti-Zero Logic)
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || !msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();

        if (body.startsWith('.ben ')) {
            const target = body.split(' ')[1];
            if (!target) return;
            const targetJid = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            
            const startMsg = await sock.sendMessage(from, { 
                text: formatLuxuriousMessage('بـدء الـتـنـفـيـذ الـحـقـيـقـي ⚔️', 
                `الـهدف: ${target}\nالـحالة: استنفار القوات...\n${createProgressBar(0, 100)}`) 
            }, { quoted: msg });

            (async () => {
                let totalHits = 0;
                const sessions = Object.keys(activeSockets);
                const opsPerSession = 10;
                const totalTarget = sessions.length * opsPerSession;

                for (const sId in activeSockets) {
                    for (let i = 0; i < opsPerSession; i++) {
                        try {
                            // تنفيذ حقيقي مع انتظار الاستجابة
                            await activeSockets[sId].reportSpam(targetJid);
                            totalHits++;
                            
                            // تحديث الشريط كل عمليتين لضمان المصداقية
                            if (totalHits % 2 === 0 || totalHits === totalTarget) {
                                await sock.sendMessage(from, { 
                                    edit: startMsg.key, 
                                    text: formatLuxuriousMessage('جـاري الإبـادة الـرقمـية 💀', 
                                    `الـتـقدم: ${createProgressBar(totalHits, totalTarget)}\nالـبلاغات الـفعـلية: ${totalHits}`) 
                                });
                            }
                            await delay(1200); // فاصل زمني لضمان قبول الطلبات
                        } catch (e) {}
                    }
                    await activeSockets[sId].updateBlockStatus(targetJid, 'block').catch(() => {});
                }

                await sock.sendMessage(from, { 
                    edit: startMsg.key, 
                    text: formatLuxuriousMessage('اكـتـمال الـمـهمـة بـنجاح ✅', 
                    `إجـمالي الـبلاغات: ${totalHits}\nالأنـظمة الـمشاركة: ${sessions.length}\nالـدقة: ١٠٠٠٪\n\n*تـم حـسم الـمـعركة بـقـوة VIP 1000* 👑`) 
                });
            })();
        }

        // 📢 المتابعة (بدون ضرر)
        if (body.startsWith('.متابعه ') || body.startsWith('.متابعة ')) {
            const link = body.split(' ')[1];
            if (!link || !link.includes('whatsapp.com/channel/')) return;
            const inviteCode = link.split('channel/')[1].split('/')[0];
            
            const supMsg = await sock.sendMessage(from, { text: `🔄 جاري تفعيل المتابعات من ${Object.keys(activeSockets).length} حساب...` }, { quoted: msg });

            let count = 0;
            for (const sId in activeSockets) {
                try {
                    const meta = await activeSockets[sId].newsletterMetadata("invite", inviteCode);
                    if (meta?.id) {
                        await activeSockets[sId].newsletterFollow(meta.id);
                        count++;
                        await delay(800);
                    }
                } catch (e) {}
            }
            await sock.sendMessage(from, { edit: supMsg.key, text: `✅ اكتمل الدعم.\nالمتابعات الحقيقية: ${count}` });
        }
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            if (statusCode !== DisconnectReason.loggedOut) {
                setTimeout(() => startWhatsAppSession(sessionId), 5000);
            }
        } else if (connection === 'open') {
            console.log(`✅ [READY] ${sessionId}`);
            if (!db.sessions[sessionId]) db.sessions[sessionId] = { welcomeSent: false };
            if (!db.sessions[sessionId].welcomeSent) {
                try {
                    const selfId = jidNormalizedUser(sock.user.id);
                    await sock.sendMessage(selfId, { text: formatLuxuriousMessage('تـم الـتـنـشـيـط', `👑 أهلاً بك في نظام 𝑻𝑨𝑹𝒁𝑨𝑵 𝑷𝑹𝑶\n\nالآن يمكنك استخدام الأوامر بحرية.`) });
                    db.sessions[sessionId].welcomeSent = true; saveDB();
                } catch (e) {}
            }
        }
    });
}

// ==========================================
// 📱 لوحة تحكم تلجرام (كاملة الميزات)
// ==========================================
const bot = new Telegraf(TG_TOKEN);

bot.start((ctx) => {
    const uid = ctx.from.id.toString();
    const isOwner = uid === OWNER_ID;
    const user = db.users[uid];
    const role = isOwner ? 'OWNER' : (user ? user.role : 'GUEST');

    if (db.config.mode === 'PAID' && role === 'GUEST') return ctx.reply("❌ النظام في وضع VIP.");

    const activeCount = Object.keys(activeSockets).length;
    let buttons = [
        [Markup.button.callback('🔗 ربط حساب جديد', 'action_pair')],
        [Markup.button.callback('📊 حالة السيرفر', 'server_status')]
    ];

    if (role === 'OWNER' || role === 'RESELLER') buttons.push([Markup.button.callback('🎫 تفعيل VIP', 'action_add_vip')]);
    if (role === 'OWNER') {
        buttons.push([Markup.button.callback('🎖️ تعيين موزع', 'action_add_reseller')]);
        buttons.push([Markup.button.callback('🔓 مجاني', 'mode_free'), Markup.button.callback('🔐 مدفوع', 'mode_paid')]);
    }

    ctx.replyWithHTML(`🔱 <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑷𝑹𝑶 VIP 1000</b> 🔱\n\nالرتبة: ${role}\nالجيش النشط: ${activeCount}`, Markup.inlineKeyboard(buttons));
});

bot.action('action_pair', (ctx) => {
    userStates[ctx.from.id] = { action: 'WAIT_PHONE' };
    ctx.reply("📱 أرسل الرقم مع رمز الدولة (966...):");
});

bot.action('server_status', (ctx) => {
    ctx.reply(`📊 حالة النظام:\n- الجيش: ${Object.keys(activeSockets).length}\n- الوضع: ${db.config.mode}\n- الخادم: مستقر ✅`);
});

bot.action('mode_free', (ctx) => { if (ctx.from.id.toString() === OWNER_ID) { db.config.mode = 'FREE'; saveDB(); ctx.reply("🔓 تم التفعيل."); } });
bot.action('mode_paid', (ctx) => { if (ctx.from.id.toString() === OWNER_ID) { db.config.mode = 'PAID'; saveDB(); ctx.reply("🔐 تم التفعيل."); } });

bot.on('text', async (ctx) => {
    const uid = ctx.from.id;
    const state = userStates[uid];
    if (!state) return;

    if (state.action === 'WAIT_PHONE') {
        const phone = ctx.message.text.replace(/[^0-9]/g, '');
        ctx.reply("⏳ جاري استخراج كود Microsoft Edge...");
        const sId = `SESSION_${Date.now()}`;
        db.sessions[sId] = { ownerTgId: uid, phone: phone };
        saveDB();
        await startWhatsAppSession(sId, phone, ctx);
        delete userStates[uid];
    } else if (state.action === 'WAIT_USER_ID') {
        db.users[ctx.message.text.trim()] = { role: 'USER', date: new Date().toISOString() };
        saveDB(); ctx.reply("✅ تمت إضافة VIP."); delete userStates[uid];
    } else if (state.action === 'WAIT_RESELLER_ID') {
        db.users[ctx.message.text.trim()] = { role: 'RESELLER', date: new Date().toISOString() };
        saveDB(); ctx.reply("💎 تمت إضافة موزع."); delete userStates[uid];
    }
});

const init = async () => {
    const sDir = path.join(__dirname, 'sessions');
    if (!fs.existsSync(sDir)) fs.mkdirSync(sDir);
    const folders = fs.readdirSync(sDir).filter(f => fs.lstatSync(path.join(sDir, f)).isDirectory());
    for (const f of folders) { try { await startWhatsAppSession(f); await delay(1500); } catch (e) {} }
    bot.launch();
    console.log("🔥 SYSTEM ONLINE");
};
init();

process.on('uncaughtException', (err) => console.error(err.message));
