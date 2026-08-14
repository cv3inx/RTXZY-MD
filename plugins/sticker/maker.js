import fs from 'fs';
import fetch from 'node-fetch';
const handler = {
  command: ['brat', 'brat2', 'bratgif', 'bratvid', 'ttp', 'attp'],
  help: ['brat', 'brat2', 'bratgif', 'bratvid', 'ttp', 'attp'],
  tags: ['sticker'],
  limit: true,
  run: async (m, { conn, args, text, usedPrefix, command, Api }) => {
    await m.reply(wait);

    text = text ? text : m.quoted && m.quoted.text ? m.quoted.text : m.quoted && m.quoted.caption ? m.quoted.caption : m.quoted && m.quoted.description ? m.quoted.description : '';

    if (!text) throw `Example: ${usedPrefix + command} Lagi Ruwet`;

    let res;
    if (command === 'brat') {
      res = Api.url('/api/maker/brat', { text: text.substring(0, 151) });
    } else if (command === 'brat2' || command === 'bratgif') {
      res = Api.url('/api/maker/brat-video', { text: text.substring(0, 151) });
    } else if (command === 'bratvid') {
      res = Api.url('/api/maker/brat-video', { text: text.substring(0, 151) });
    } else if (command === 'ttp') {
      res = Api.url('/api/maker/ttp', { text: text.substring(0, 151) });
    } else if (command === 'attp') {
      res = Api.url('/api/maker/attp', { text: text.substring(0, 151) });
    }

    const err = fs.readFileSync(`./media/sticker/emror.webp`);

    try {
      const response = await fetch(res);
      const buffer = await response.buffer();

      if (command === 'attp') {
        await conn.sendFile(m.chat, buffer, 'sticker.webp', '', m);
      } else if (command === 'bratvid' || command === 'brat2' || command === 'bratgif') {
        await conn.sendVideoAsSticker(m.chat, buffer, m, { packname: global.config.branding.stickerPackname, author: global.config.branding.stickerAuthor });
      } else {
        await conn.sendImageAsSticker(m.chat, buffer, m, { packname: global.config.branding.stickerPackname, author: global.config.branding.stickerAuthor });
      }
    } catch (e) {
      console.error(e);
      await conn.sendImageAsSticker(m.chat, err, m, { packname: global.config.branding.stickerPackname, author: global.config.branding.stickerAuthor });
    }
  }
};

export default handler;
