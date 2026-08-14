const handler = {
  help: ['ytmp3', 'yta'],
  command: ['ytmp3', 'yta'],
  tags: ['downloader'],
  exp: 0,
  limit: true,
  premium: false,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `*Example:* ${usedPrefix + command} https://www.youtube.com/watch?v=Z28dtg_QmFw`;
    m.reply(wait);
    try {
      const response = await Api.get('/api/dowloader/yt', { url: text });
      const result = await response.json();

      if (result.status && result.result && result.result.mp3) {
        await conn.sendMessage(
          m.chat,
          {
            audio: { url: result.result.mp3 },
            mimetype: 'audio/mpeg'
          },
          { quoted: m }
        );
      } else {
        throw 'Error: Unable to fetch audio';
      }
    } catch (error) {
      throw eror;
    }
  }
};

export default handler;
