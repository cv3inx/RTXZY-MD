import fs from 'fs';
import fetch from 'node-fetch';
const handler = {
  help: ['aistiker'],
  usage: '<prompt>',
  tags: ['sticker'],
  command: ['aistiker', 'as', 'ais', 'aisticker', 'stickerai'],
  limit: true,
  run: async (m, { conn, command, usedPrefix, text, Api }) => {
    if (!text) throw `Kirim prompt dengan cara ${usedPrefix + command} <prompt>`;

    let apiUrl = Api.url('/api/search/openai-image', { text });
    let res = await fetch(apiUrl);
    if (!res.ok) throw 'Gagal mengambil gambar dari API';
    let buffer = await res.buffer();

    let filePath = './tmp/tmp-sticker.png';
    fs.writeFileSync(filePath, buffer);

    m.reply(stiker_wait);
    let encmedia = await conn.sendImageAsSticker(m.chat, buffer, m, { packname: global.config.branding.stickerPackname, author: global.config.branding.stickerAuthor });

    await fs.unlinkSync(encmedia);
    await fs.unlinkSync(filePath);
  }
};

export default handler;

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png|mp4)/, 'gi'));
};
