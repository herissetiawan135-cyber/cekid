require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
const ADMIN_ID = process.env.ADMIN_ID; // ID Admin untuk broadcast
let users = new Set(); // Menyimpan ID pengguna

// Handle /start command with welcome message and menu buttons
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    users.add(chatId);
    const options = {
        reply_markup: {
            keyboard: [
                [{ text: "/cekid" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    };
    bot.sendMessage(chatId, `Halo! Selamat datang di bot cek ID Telegram. \n\nGunakan perintah /cekid untuk mengetahui ID kamu atau grup/channel.`, options);
});

// Handle /cekid command with optional username input
bot.onText(/\/cekid(?:\s(.*))?/, (msg, match) => {
    const chatId = msg.chat.id;
    users.add(chatId);
    const input = match[1];
    
    if (input) {
        bot.getChat(input).then(chat => {
            bot.sendMessage(chatId, `ID untuk ${input} adalah: \`${chat.id}\``, { parse_mode: 'Markdown' });
        }).catch(() => {
            bot.sendMessage(chatId, `Gagal mendapatkan ID dari ${input}. Pastikan itu adalah username grup atau channel yang benar.`);
        });
    } else {
        bot.sendMessage(chatId, `ID chat ini adalah: \`${chatId}\``, { parse_mode: 'Markdown' });
    }
});

// Handle bot added to a group
bot.on('new_chat_members', (msg) => {
    bot.sendMessage(msg.chat.id, `Halo! ID grup ini adalah: \`${msg.chat.id}\``, { parse_mode: 'Markdown' });
});

// Handle admin broadcast
bot.onText(/\/broadcast (.+)/, (msg, match) => {
    if (msg.chat.id.toString() !== ADMIN_ID) {
        bot.sendMessage(msg.chat.id, "⚠️ Hanya admin yang dapat menggunakan perintah ini.");
        return;
    }
    
    const message = match[1];
    users.forEach(userId => {
        bot.sendMessage(userId, message);
    });
    bot.sendMessage(ADMIN_ID, "✅ Broadcast telah dikirim.");
});
