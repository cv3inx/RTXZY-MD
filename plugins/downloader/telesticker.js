const handler = {
  help: ['telesticker'],
  command: ['telesticker', 'stele'],
  tags: ['sticker'],
  premium: true,
  limit: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `🚩 *Example:* ${usedPrefix + command} https://t.me/addstickers/fuwayonimaa_by_fStikBot`;
    if (!text.match(/(https:\/\/t.me\/addstickers\/)/gi)) throw `🚩 *Example:* ${usedPrefix + command} https://t.me/addstickers/fuwayonimaa_by_fStikBot`;
    m.reply(wait);
    try {
      let res = await (await Api.get('/api/download/telesticker', { url: text })).json();
      let { result } = res;
      let total = result.length;
      let est = total * 0.5;
      m.reply(`Processing ${total} stickers`);
      for (var i = 0; i < result.length; i++) {
        var url = result[i].url;
        await sleep(10000);
        await conn.sendImageAsSticker(m.chat, url, null, { packname: global.config.branding.stickerPackname, author: global.config.branding.stickerAuthor });
      }
      await conn.reply(m.chat, `Total ${total} stickers successfully sent`, m);
    } catch (e) {
      throw `🚩 ${eror}`;
    }
  }
};

export default handler;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
