require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { createCanvas, loadImage } = require('canvas');
const fetch = require('node-fetch');
const fs = require('fs');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// ===== CONFIG =====
const CHANNEL_LINK = "https://t.me/dotzstorereall";
const OWNER_LINK   = "https://t.me/dotzbaik80";
const START_PHOTO  = "https://files.catbox.moe/obj8wm.jpg";

// ===== START =====
bot.onText(/\/start/, (msg) => {
    bot.sendPhoto(msg.chat.id, START_PHOTO, {
        caption: `👋 Halo ${msg.from.first_name}!\nSelamat datang di bot *Cek ID Telegram*`,
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

// ===== CALLBACK =====
bot.on("callback_query", async (query) => {
    if (query.data !== "cekid_saya") return;

    const chatId = query.message.chat.id;
    const user = query.from;

    // ===== GET FOTO PROFIL USER =====
    let avatarPath = null;

    try {
        const photos = await bot.getUserProfilePhotos(user.id, { limit: 1 });
        if (photos.total_count > 0) {
            const fileId = photos.photos[0][0].file_id;
            const file = await bot.getFile(fileId);
            const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${file.file_path}`;

            const res = await fetch(url);
            const buffer = await res.buffer();
            avatarPath = `avatar_${user.id}.jpg`;
            fs.writeFileSync(avatarPath, buffer);
        }
    } catch (e) {
        console.log("Gagal ambil foto profil");
    }

    // ===== CANVAS =====
    const canvas = createCanvas(1000, 600);
    const ctx = canvas.getContext('2d');

    const bg = await loadImage('./template.png');
    ctx.drawImage(bg, 0, 0, 1000, 600);

    // ===== FOTO KANAN =====
    if (avatarPath) {
        const avatar = await loadImage(avatarPath);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 6;
        ctx.strokeRect(700, 150, 230, 230);
        ctx.drawImage(avatar, 700, 150, 230, 230);
        fs.unlinkSync(avatarPath);
    }

    // ===== TEXT =====
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px Sans";
    ctx.fillText("KARTU TANDA PENDUDUK TELEGRAM", 40, 70);

    ctx.font = "bold 30px Sans";
    ctx.fillStyle = "#FFD700";
    ctx.fillText("NIK", 40, 150);
    ctx.fillText("Name", 40, 210);
    ctx.fillText("UserName", 40, 270);
    ctx.fillText("Type", 40, 330);
    ctx.fillText("DC ID", 40, 390);

    ctx.font = "30px Sans";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`: ${user.id}`, 240, 150);
    ctx.fillText(`: ${user.first_name}`, 240, 210);
    ctx.fillText(`: @${user.username || "tidak ada"}`, 240, 270);
    ctx.fillText(`: user`, 240, 330);
    ctx.fillText(`: 5`, 240, 390);

    // ===== SAVE & SEND =====
    const fileName = `ktp_${user.id}.png`;
    fs.writeFileSync(fileName, canvas.toBuffer());

    await bot.sendPhoto(chatId, fileName, {
        caption: "STORE AMAN DAN TERPERCAYA ✅"
    });

    fs.unlinkSync(fileName);
    bot.answerCallbackQuery(query.id);
});
