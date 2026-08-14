const handler = {
  help: ['lirik'].map((v) => v + ' <Title>'),
  tags: ['internet'],
  command: /^(lirik|lyrics|lyric)$/i,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `Ex: ${usedPrefix}${command} Jiwa yang bersedih`;
    await m.reply(wait);
    try {
      let data = await (await Api.get('/api/search/lirik', { lirik: text })).json();
      let caption = `
${data.result.lyrics}

ℹ️ More info:
🔗 ${data.result.image}
🎤 Artist: ${data.result.artist}`;
      await conn.sendMessage(m.chat, { image: { url: data.result.image }, caption: caption, mentions: [m.sender] }, { quoted: m });
    } catch (e) {
      console.log(e);
      m.reply('Terjadi kesalahan, silahkan coba lagi nanti');
    }
  }
};

export default handler;
