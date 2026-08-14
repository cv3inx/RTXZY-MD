const handler = {
  help: ['douyin'],
  command: /^(douyin)$/i,
  tags: ['downloader'],
  limit: true,
  group: false,
  premium: false,
  owner: false,
  admin: false,
  botAdmin: false,
  fail: null,
  private: false,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `Masukan URL!\n\ncontoh:\n${usedPrefix + command} https://v.douyin.com/ikq8axJ/`;
    try {
      if (!text.match(/douyin/gi)) throw `URL Tidak Ditemukan!`;
      m.reply(wait);
      const response = await Api.get('/api/dowloader/douyin', { url: text })
        .then((r) => r.json())
        .then((data) => ({ data }));
      const res = response.data.result;
      var { video, title, title_audio, audio } = res;
      let capt = `乂 *D O U Y I N*\n\n`;
      capt += `◦ *Title* : ${title}\n`;
      capt += `◦ *Audio* : ${title_audio}\n`;
      capt += `\n`;
      await conn.sendFile(m.chat, video, null, capt, m);
      conn.sendMessage(m.chat, { audio: { url: audio[0] }, mimetype: 'audio/mpeg' }, { quoted: m });
    } catch (e) {
      console.log(e);
      throw `🚩 ${eror}`;
    }
  }
};

export default handler;
