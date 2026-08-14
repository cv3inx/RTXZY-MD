import { sticker5 } from '../../lib/media/sticker.js';
let handler = async (m, { conn, command, text, usedPrefix, Api }) => {
  if (!text) throw `🚩 *Contoh:* ${usedPrefix + command} 🗿`;
  await conn.reply(m.chat, wait, m);
  try {
    if (command == 'stikapple') {
      const res = Api.url('/api/emoji/apple', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    } else if (command == 'stikgoogle') {
      const res = Api.url('/api/emoji/google', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    } else if (command == 'stiksamsung') {
      const res = Api.url('/api/emoji/samsung', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    } else if (command == 'stikmicrosoft') {
      const res = Api.url('/api/emoji/microsoft', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    } else if (command == 'stikwhatsapp') {
      const res = Api.url('/api/emoji/whatsapp', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    } else if (command == 'stiktwitter') {
      const res = Api.url('/api/emoji/twitter', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    } else if (command == 'stikfacebook') {
      const res = Api.url('/api/emoji/facebook', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    } else if (command == 'stikskype') {
      const res = Api.url('/api/emoji/skype', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    } else if (command == 'stikjoypixels') {
      const res = Api.url('/api/emoji/joypixels', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    } else if (command == 'stikopenmoji') {
      const res = Api.url('/api/emoji/openmoji', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    } else if (command == 'stikemojipedia') {
      const res = Api.url('/api/emoji/emojipedia', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    } else if (command == 'stiklg') {
      const res = Api.url('/api/emoji/lg', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    } else if (command == 'stikjoypixels') {
      const res = Api.url('/api/emoji/joypixels', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    } else if (command == 'stikhtc') {
      const res = Api.url('/api/emoji/htc', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    } else if (command == 'stikmozilla') {
      const res = Api.url('/api/emoji/mozilla', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    } else if (command == 'stiksoftbank') {
      const res = Api.url('/api/emoji/softbank', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    } else if (command == 'stikdocomo') {
      const res = Api.url('/api/emoji/docomo', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    } else if (command == 'stikkddi') {
      const res = Api.url('/api/emoji/kddi', { emoji: text });
      var stiker = await sticker5(res, { packname });
      await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
    }
  } catch (e) {
    console.log(e);
    throw '*🚩 Stiker tidak di temukan!*';
  }
};

handler.command = handler.help = ['stikapple', 'stikkddi', 'stikgoogle', 'stikdocomo', 'stiksoftbank', 'stikhtc', 'stikmozilla', 'stiklg', 'stikopenmoji', 'stikemojipedia', 'stikjoypixels', 'stikopenmoji', 'stikfacebook', 'stikskype', 'stikwhatsapp', 'stiktwitter', 'stiksamsung', 'stikmicrosoft'];
handler.tags = ['sticker'];
handler.limit = true;
export default handler;
