import * as zapo from '../../lib/simple.js';

import fs from 'fs';

import { sticker5 } from '../../lib/media/sticker.js';
let handler = async (m, { conn, text, args, Api }) => {
  const { MessageType } = zapo;

  if (!args[0]) throw 'Contoh penggunaan:\n\n*.emojimix 🤨+😣*';
  try {
    let [emoji1, emoji2] = text.split`+`;
    let anu = await Api.get('/api/emoji/emojimix', { emoji1, emoji2 });
    let res = await anu.json();
    let stiker = await sticker5(res.result.results[0].media_formats.png_transparent.url, false, packname, author);
    await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m);
  } catch (e) {
    m.reply('*🚩 Emoji tidak support!*');
  }
};

handler.help = ['emojimix'];
handler.tags = ['sticker'];
handler.command = /^(emojimix)$/i;
handler.limit = true;
export default handler;
