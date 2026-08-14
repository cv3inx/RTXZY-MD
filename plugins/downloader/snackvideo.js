const handler = {
  command: ['snackvideo'],
  help: ['snackvideo'],
  tags: ['downloader'],
  limit: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `Masukan URL!\n\ncontoh:\n${usedPrefix + command} https://s.snackvideo.com/p/j9jKr9dR`;
    try {
      if (!text.match(/snackvideo/gi)) throw `URL Tidak Ditemukan!`;
      m.reply(wait);
      const response = await Api.get('/api/download/snackvideo', { url: text })
        .then((r) => r.json())
        .then((data) => ({ data }));
      const res = response.data.result;
      var { media, title, thumbnail, authorImage, author, like, comment, share } = res;
      let capt = `乂 *S N A C K   V I D E O*\n\n`;
      capt += `◦ *Title* : ${title}\n`;
      capt += `◦ *Author* : ${author}\n`;
      capt += `◦ *Like* : ${like}\n`;
      capt += `◦ *comment* : ${comment}\n`;
      capt += `◦ *Share* : ${share}\n`;
      capt += `\n`;
      await conn.sendFile(m.chat, media, null, capt, m);
    } catch (e) {
      throw eror;
    }
  }
};

export default handler;
