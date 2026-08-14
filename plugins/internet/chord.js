const handler = {
  help: ['chord'],
  usage: 'judul lagu',
  tags: ['internet'],
  command: 'chord',
  limit: true,
  run: async (m, { text, command, usedPrefix, Api }) => {
    if (!text) throw `Example: ${usedPrefix + command} Janji Suci Yovie Nuno`;
    m.reply(wait);
    try {
      let response = await Api.get('/api/search/chord', { song: text });
      let data = await response.json();

      if (data.status && data.result) {
        let txt = `乂 *C H O R D  M U S I C*\n\n`;
        txt += `◦ *Title:* ${data.result.title ? data.result.title : text}\n`;
        txt += `◦ *Chord:* ${data.result.chord ? data.result.chord : 'Tidak ditemukan!'}\n\n`;
        text += `\n`;
        await m.reply(txt);
      } else {
        await m.reply('Lagu tidak ditemukan!');
      }
    } catch (error) {
      throw eror;
    }
  }
};

export default handler;
