require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Token bot dari .env
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// Hardcode owner & channel
const CHANNEL_LINK = "https://t.me/dotzstorereall";
const OWNER_LINK = "https://t.me/dotzbaik80";

// Foto start & card
const START_PHOTO = "https://files.catbox.moe/obj8wm.jpg"; // ganti dengan URL gambar langsung
const CARD_PHOTO = "https://files.catbox.moe/obj8wm.jpg";   // ganti dengan template card

// ----- START -----
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendPhoto(chatId, START_PHOTO, {
        caption: `👋 Halo ${msg.from.first_name}!\nSelamat datang di bot cek ID Telegram.`,
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "📢 Channel", url: CHANNEL_LINK },
                    { text: "👤 Owner", url: OWNER_LINK }
                ],
                [
                    { text: "🆔 Cek ID Saya", callback_data: "cekid_saya" }
                ]
            ]
        }
    });
});

// ----- CALLBACK QUERY -----
bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const user = query.from;

    if (query.data === "cekid_saya") {
        // Kirim CARD sederhana pakai foto + caption
        const caption = `
🪪 *KARTU IDENTITAS TELEGRAM*
━━━━━━━━━━━━━━━━━━
👤 Nama: *${user.first_name}*
🆔 ID: \`${user.id}\`
🌐 Username: @${user.username || "tidak ada"}
        `;

        await bot.sendPhoto(chatId, CARD_PHOTO, {
            caption: caption,
            parse_mode: "Markdown"
        });

        return bot.answerCallbackQuery(query.id); // tombol “tertekan” hilang
    }
});

// ----- Bot masuk grup -----
bot.on("new_chat_members", (msg) => {
    bot.sendMessage(
        msg.chat.id,
        `Halo! ID grup ini: \`${msg.chat.id}\``,
        { parse_mode: "Markdown" }
    );
});

