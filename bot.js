require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { createCanvas, loadImage } = require("canvas");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// ====== CONFIG ======
const START_PHOTO = "https://files.catbox.moe/jehl2n.png";

const OWNER_URL   = "https://t.me/dotzbaik";
const CHANNEL_URL = "https://t.me/dotzstorereall";
const ALLBOT_URL  = "https://t.me/ZeusXubot";

// ================= START =================
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendPhoto(
    chatId,
    START_PHOTO,
    {
      caption:
`🪪 *CEK ID TELEGRAM*

Halo *${msg.from.first_name}* 👋  
Gunakan tombol di bawah untuk melihat ID Telegram kamu
dalam bentuk *KTP Telegram*.`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "👤 Owner", url: OWNER_URL },
            { text: "📢 Channel", url: CHANNEL_URL }
          ],
          [
            { text: "🤖 All Bot", url: ALLBOT_URL }
          ],
          [
            { text: "🆔 Cek ID Saya", callback_data: "buat_ktp" }
          ]
        ]
      }
    }
  );
});

// ================= CALLBACK =================
bot.on("callback_query", async (q) => {
  if (q.data !== "buat_ktp") return;

  const user = q.from;
  const chatId = q.message.chat.id;

  const canvas = createCanvas(1000, 600);
  const ctx = canvas.getContext("2d");

  // ===== BACKGROUND =====
  const gradient = ctx.createLinearGradient(0, 0, 1000, 600);
  gradient.addColorStop(0, "#12002b");
  gradient.addColorStop(0.5, "#3b2a6f");
  gradient.addColorStop(1, "#b11e5c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ===== TITLE =====
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 38px Sans";
  ctx.fillText("KARTU TANDA PENDUDUK TELEGRAM", 40, 65);

  // ===== LABEL =====
  ctx.font = "bold 26px Sans";
  ctx.fillStyle = "#ffd54f";
  ctx.fillText("NIK", 40, 150);
  ctx.fillText("Nama", 40, 205);
  ctx.fillText("Username", 40, 260);
  ctx.fillText("Tipe", 40, 315);
  ctx.fillText("DC ID", 40, 370);

  // ===== VALUE =====
  ctx.fillStyle = "#ffffff";
  ctx.font = "26px Sans";
  ctx.fillText(`: ${user.id}`, 200, 150);
  ctx.fillText(`: ${user.first_name}`, 200, 205);
  ctx.fillText(`: @${user.username || "tidak ada"}`, 200, 260);
  ctx.fillText(`: User`, 200, 315);
  ctx.fillText(`: 5`, 200, 370);

  // ===== FOTO PROFIL =====
  try {
    const photos = await bot.getUserProfilePhotos(user.id, { limit: 1 });
    if (photos.total_count > 0) {
      const fileId = photos.photos[0][0].file_id;
      const file = await bot.getFile(fileId);
      const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${file.file_path}`;
      const avatar = await loadImage(url);

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 5;
      ctx.strokeRect(720, 150, 220, 220);
      ctx.drawImage(avatar, 725, 155, 210, 210);
    }
  } catch (err) {}

  const buffer = canvas.toBuffer();
  await bot.sendPhoto(chatId, buffer, {
    caption: "✅ *KTP Telegram berhasil dibuat*",
    parse_mode: "Markdown"
  });

  bot.answerCallbackQuery(q.id);
});
