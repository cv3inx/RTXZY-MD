import pkg from 'node-webpmux';
const { Image } = pkg;

const handler = {
  help: ['setcmd'],
  usage: 'teks',
  tags: ['database', 'premium'],
  command: ['setcmd'],
  premium: true,
  fail: null,
  run: async (m, { conn, text, usedPrefix, command }) => {
    db.data.sticker = db.data.sticker || {};

    if (!m.quoted) throw `Balas stiker dengan perintah *${usedPrefix + command} ${usedPrefix}afk*`;
    if (!m.quoted.fileSha256) throw 'SHA256 Hash Missing';
    if (!text) throw `Penggunaan:\n${usedPrefix + command} <teks>\n\nContoh:\n*${usedPrefix + command} ${usedPrefix}afk*`;

    let sticker = db.data.sticker;
    let hash = Buffer.from(m.quoted.fileSha256).toString('hex');

    if (sticker[hash] && sticker[hash].locked) throw 'Kamu tidak memiliki izin untuk mengubah perintah stiker ini';

    // Extract sticker-pack-id from quoted sticker's WEBP EXIF
    let packId = null;
    try {
      const buffer = await m.quoted.download();
      if (buffer) {
        const img = new Image();
        await img.load(buffer);
        if (img.exif) {
          packId = JSON.parse(img.exif.slice(22).toString())['sticker-pack-id'] || null;
        }
      }
    } catch {
      // Stiker tanpa exif atau exif rusak: packId tetap null, bukan kegagalan.
    }

    sticker[hash] = {
      text,
      mentionedJid: m.mentionedJid,
      creator: m.sender,
      at: +new Date(),
      locked: false,
      packId
    };

    m.reply(`✅ Berhasil mengaitkan perintah *${text}* ke stiker ini!`);
  }
};

export default handler;
