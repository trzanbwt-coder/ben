/**
 * 👑 𝑻𝑨𝑹𝒁𝑨𝑵 𝑩𝑬𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷 - 𝑬𝑫𝑰𝑻𝑰𝑶𝑵 𝑽𝑰𝑷 𝟏𝟎𝟎𝟎 𝑷𝑹𝑶 👑
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * نظام القوة المطلقة - إصدار المعالجة الحديدية (Anti-Zero)
 * تم إصلاح خطأ العدادات الصفرية عبر المعالجة المتزامنة الصارمة.
 * ⚠️ لا تهاون، لا عمليات وهمية، فقط تنفيذ حقيقي وموثق.
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
// 🔱 محرك التنسيق الملكي VIP 1000 🔱
// ==========================================
function formatLuxuriousMessage(title, content) {
    const frameTop    = `╔══════════ ≪ 🔱 𝑽𝑰𝑷 𝟏𝟎𝟎𝟎 🔱 ≫ ══════════╗`;
    const frameBottom = `╚══════════ ≪ 🔱 𝑽𝑰𝑷 𝟏𝟎𝟎𝟎 🔱 ≫ ══════════╝`;
    const separator   = `╟────────────────────────────────────────╢`;
    let lines = content.split('\n').map(line => `   ◈ ${line}`).join('\n');
    return `${frameTop}\n   ✨ *${title}*\n${separator}\n\n${lines}\n\n${separator}\n   👑 _𝑻𝑨𝑹𝒁𝑨𝑵 𝑼𝑳𝑻𝑹𝑨 𝑽𝑰𝑷 𝑺𝒀𝑺𝑻𝑬𝑴_\n${frameBottom}`;
}

function createProgressBar(current, total) {
    const size = 10;
    const progress = Math.min(Math.round((current / total) * size), size);
    const emptyProgress = size - progress;
    const bar = "▓".repeat(progress) + "░".repeat(emptyProgress);
    const percent = Math.min(Math.round((current / total) * 100), 100);
    return `📊 ${bar} ${percent}%`;
}

// ==========================================
// ⚙️ إدارة الخادم والقاعدة
// ==========================================
const app = express();
app.get('/', (req, res) => res.send('👑 VIP 1000 ACTIVE 👑'));
app.listen(process.env.PORT || 3000);

const TG_TOKEN = '8831436238:AAF9M5hGwNbQwfoLKOr_XYS2Qij6WOA7Krw'; 
const OWNER_ID = '8794826397'; 
const DB_FILE = path.join(__dirname, 'tarzan_master_db.json');

let db = { config: { mode: 'FREE' }, users: {}, sessions: {} };
if (fs.existsSync(DB_FILE)) {
    try { db = { ...db, ...JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) }; } catch (e) {}
}
const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

const activeSockets = {}; 
const userStates = {}; 

// ==========================================
// ⚔️ محرك الواتساب (الإبادة الحقيقية - إصلاح الصفر)
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
        logger: pino({ level: 'silent' }),
        browser: ["Windows", "Edge", "110.0.1587.41"],
        printQRInTerminal: false
    });

    activeSockets[sessionId] = sock;
    sock.ev.on('creds.update', saveCreds);

    if (phoneNumber && !sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                if (tgContext) await tgContext.replyWithHTML(`🔱 كود الربط: <code>${code}</code>`);
            } catch (e) {}
        }, 3000);
    }

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || !msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();

        if (body.startsWith('.ben ')) {
            const input = body.split(' ')[1];
            if (!input) return;

            let targetJid = '';
            let targetType = 'حساب';

            if (input.includes('chat.whatsapp.com/')) {
                targetType = 'مجموعة';
                targetJid = input.split('chat.whatsapp.com/')[1];
            } else if (input.includes('whatsapp.com/channel/')) {
                targetType = 'قناة';
                targetJid = input.split('channel/')[1].split('/')[0];
            } else {
                targetJid = input.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }

            const startMsg = await sock.sendMessage(from, { 
                text: formatLuxuriousMessage('بـدء الإبـادة الـحقيقية 😈', 
                `الـهدف: ${input}\nالـوضع: VIP 1000\nالـحالة: جاري تفعيل البروتوكول...\n${createProgressBar(0, 100)}`) 
            }, { quoted: msg });

            (async () => {
                let realReports = 0;
                let realSuccess = 0;
                const sessions = Object.keys(activeSockets);
                const reportsPerSession = 10;
                const totalTarget = sessions.length * reportsPerSession;

                for (const sId of sessions) {
                    const s = activeSockets[sId];
                    if (!s) continue;

                    try {
                        let sessionSuccess = false;
                        if (targetType === 'حساب') {
                            for (let i = 0; i < reportsPerSession; i++) {
                                // استخدام الـ Await الحقيقي لضمان التنفيذ قبل الزيادة
                                await s.reportSpam(targetJid);
                                realReports++;
                                sessionSuccess = true;
                                
                                // تحديث الرسالة كل بلاغين ليرى المستخدم التقدم الفعلي
                                if (realReports % 2 === 0 || realReports === totalTarget) {
                                    await sock.sendMessage(from, { 
                                        edit: startMsg.key, 
                                        text: formatLuxuriousMessage('جـاري الـتـنفيذ الـحقيقي ⚔️', 
                                        `الـتـقدم: ${createProgressBar(realReports, totalTarget)}\nإجـمالي الـبلاغات: ${realReports}`) 
                                    });
                                }
                                await delay(1500); 
                            }
                            await s.updateBlockStatus(targetJid, 'block');
                        } 
                        else if (targetType === 'مجموعة') {
                            const gJid = await s.groupAcceptInvite(targetJid);
                            await delay(2000);
                            for (let i = 0; i < reportsPerSession; i++) {
                                await s.reportSpam(gJid);
                                realReports++;
                                sessionSuccess = true;
                                await delay(1000);
                            }
                            await s.groupLeave(gJid);
                        }

                        if (sessionSuccess) realSuccess++;
                    } catch (e) {
                        console.error(`Error in session ${sId}:`, e.message);
                    }
                }

                const finalReport = `إجـمالي الـبـلاغات: ${realReports}\nالـعمليات الـناجحة: ${realSuccess}\nالـجيش الـمشارك: ${sessions.length}\n\n*تـم الـتـدمـير بـنـجاح تـام VIP 1000* 👑😈`;
                await sock.sendMessage(from, { 
                    edit: startMsg.key, 
                    text: formatLuxuriousMessage('اكـتـمال الإبـادة ✅', finalReport) 
                });
            })();
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                setTimeout(() => startWhatsAppSession(sessionId), 5000);
            }
        }
    });
}

// ==========================================
// 📱 لوحة تحكم تلجرام (النسخة الكاملة)
// ==========================================
const bot = new Telegraf(TG_TOKEN);

bot.start((ctx) => {
    const uid = ctx.from.id.toString();
    const isOwner = uid === OWNER_ID;
    const user = db.users[uid];
    const role = isOwner ? 'OWNER' : (user ? user.role : 'GUEST');

    let buttons = [
        [Markup.button.callback('🔗 ربط VIP 1000', 'action_pair')],
        [Markup.button.callback('📊 حالة الجيش', 'server_status')]
    ];
    
    if (role === 'OWNER' || role === 'RESELLER') buttons.push([Markup.button.callback('🎫 تفعيل VIP', 'action_add_vip')]);
    
    ctx.replyWithHTML(`🔱 <b>𝑻𝑨𝑹𝒁𝑨𝑵 𝑷𝑹𝑶 VIP 1000</b> 🔱\nالرتبة: ${role}\nالجيش: ${Object.keys(activeSockets).length}`, Markup.inlineKeyboard(buttons));
});

bot.action('action_pair', (ctx) => {
    userStates[ctx.from.id] = { action: 'WAIT_PHONE' };
    ctx.reply("📱 أرسل رقم الهاتف مع رمز الدولة:");
});

bot.on('text', async (ctx) => {
    const uid = ctx.from.id;
    const state = userStates[uid];
    if (!state) return;

    if (state.action === 'WAIT_PHONE') {
        const phone = ctx.message.text.replace(/[^0-9]/g, '');
        const sId = `VIP_${Date.now()}`;
        await startWhatsAppSession(sId, phone, ctx);
        delete userStates[uid];
    }
});

const init = async () => {
    const sDir = path.join(__dirname, 'sessions');
    if (!fs.existsSync(sDir)) fs.mkdirSync(sDir, { recursive: true });
    bot.launch();
    console.log("🔥 VIP 1000 IRON ENGINE ONLINE");
};
init();
