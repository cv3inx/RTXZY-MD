const handler = {
  help: ['kuaishou <url>'],
  tags: ['downloader'],
  command: /^(kuaishou|ks)$/i,
  limit: true,
  group: false,
  premium: false,
  owner: false,
  admin: false,
  botAdmin: false,
  fail: null,
  private: false,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `Example: ${usedPrefix + command} https://v.kuaishou.com/KT2lZm23`;

    try {
      await m.reply(wait);
      let old = new Date();
      const response = await Api.get('/api/dowloader/kuaishou', { url: text })
        .then((r) => r.json())
        .then((data) => ({ data }));
      let res = response.data.result;

      let capt = `乂 *K U A I S H O U*\n\n`;
      capt += `◦ *Title* : ${res.title || 'Not available'}\n`;
      capt += `◦ *Author* : ${res.author || 'Not available'}\n`;
      capt += `◦ *Username* : ${res.username || 'Not available'}\n`;
      capt += `◦ *Likes* : ${res.likeCount || 0}\n`;
      capt += `◦ *Comments* : ${res.commentCount || 0}\n`;
      capt += `◦ *Views* : ${res.viewCount || 0}\n`;
      capt += `◦ *Duration* : ${res.duration ? res.duration / 1000 + ' seconds' : 'Not available'}\n`;
      capt += `◦ *🍟 Fetching* : ${(new Date() - old) * 1} ms\n`;
      capt += `\n`;

      if (res.videoUrl) {
        await conn.sendFile(m.chat, res.videoUrl, null, capt, m);
      } else {
        throw 'Video not found';
      }
    } catch (e) {
      console.log(e);
      throw eror;
    }
  }
};

export default handler;
