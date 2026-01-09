const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const axios = require('axios');
const config = require('./config');
const readline = require("readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startCHAMi() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const conn = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })) },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: [ "Ubuntu", "Chrome", "20.0.04" ],
    });

    if (!conn.authState.creds.registered) {
        const phoneNumber = await question('Phone Number (ex: 94712345678): ');
        const code = await conn.requestPairingCode(phoneNumber.trim());
        console.log(`\n==== PAIRING CODE: ${code} ====\n`);
    }

    conn.ev.on('creds.update', saveCreds);
    conn.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        if (!body.startsWith(config.prefix)) return;

        const command = body.slice(config.prefix.length).trim().split(' ')[0].toLowerCase();
        const text = body.trim().split(/ +/).slice(1).join(" ");
        const reply = async (txt) => { await conn.sendMessage(from, { image: { url: config.imgUrl }, caption: `🚀 *${config.botName}*\n\n${txt}\n\n*${config.footer}*` }); };

        switch (command) {
            case 'alive': await reply(`👋 HI, ${config.ownerName}\n*I'M ALIVE NOW* 👾\n\n📅 *Date:* 09/01/2026\n⌚ *Time:* 20:04:14`); break;
            case 'jid': await conn.sendMessage(from, { text: `JID: ${from}` }); break;
            case 'fo': if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) { await conn.sendMessage(from, { forward: msg.message.extendedTextMessage.contextInfo.quotedMessage }); } break;
            [span_2](start_span)case 'ai': const ai = await axios.get(`https://movanest.xyz/v2/pollination?text=${text}`); await reply(ai.data.result); break;[span_2](end_span)
            [span_3](start_span)case 'yts': const yts = await axios.get(`https://movanest.xyz/v2/ytsearch?query=${text}`); await reply(`Search: ${yts.data.url}`); break;[span_3](end_span)
            [span_4](start_span)case 'ytmp4': const ytv = await axios.get(`https://movanest.xyz/v2/ytmp4?url=${text}`); await conn.sendMessage(from, { video: { url: ytv.data.download_url }, caption: config.footer }); break;[span_4](end_span)
            [span_5](start_span)case 'ytmp3': const yta = await axios.get(`https://movanest.xyz/v2/ytmp3?url=${text}`); await conn.sendMessage(from, { audio: { url: yta.data.download_url }, mimetype: 'audio/mpeg' }); break;[span_5](end_span)
            [span_6](start_span)case 'fb': const fb = await axios.get(`https://movanest.xyz/v2/fbdown?url=${text}`); await conn.sendMessage(from, { video: { url: fb.data.url }, caption: config.footer }); break;[span_6](end_span)
            [span_7](start_span)case 'tiktok': const tt = await axios.get(`https://movanest.xyz/v2/tiktok?url=${text}`); await conn.sendMessage(from, { video: { url: tt.data.url }, caption: config.footer }); break;[span_7](end_span)
            [span_8](start_span)case 'removebg': const rb = await axios.get(`https://movanest.xyz/v2/removebg?image_url=${text}`); await conn.sendMessage(from, { image: { url: rb.data.url }, caption: config.footer }); break;[span_8](end_span)
            [span_9](start_span)case 'ssweb': const ss = await axios.get(`https://movanest.xyz/v2/ssweb?url=${text}`); await conn.sendMessage(from, { image: { url: ss.data.url }, caption: config.footer }); break;[span_9](end_span)
            [span_10](start_span)case 'tr': const tr = await axios.get(`https://movanest.xyz/v2/translate?text=${text}`); await reply(tr.data.result); break;[span_10](end_span)
            [span_11](start_span)case 'movie': const mv = await axios.get(`https://chamidu-cinesubz-se-90.deno.dev/search?q=${text}`); await reply(`Movie Search: ${text}`); break;[span_11](end_span)
            [span_12](start_span)case 'news': const nw = await axios.get(`https://movanest.xyz/v2/news/fetch?category=${text}`); await reply(`Fetching News...`); break;[span_12](end_span)
        }
    });
}
startCHAMi();
