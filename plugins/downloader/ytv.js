let handler = async (m, { conn, text, usedPrefix, command, Api }) => {
  if (!text) throw `*Example:* ${usedPrefix + command} https://www.youtube.com/watch?v=Z28dtg_QmFw`;
  m.reply(wait);
  try {
    const response = await Api.get('/api/dowloader/yt', { url: text });
    const result = await response.json();

    if (result.status && result.result && result.result.mp4) {
      await conn.sendMessage(
        m.chat,
        {
          video: { url: result.result.mp4 },
          mimetype: 'video/mp4'
        },
        { quoted: m }
      );
    } else {
      throw 'Error: Unable to fetch video';
    }
  } catch (error) {
    throw eror;
  }
};

handler.help = handler.command = ['ytmp4', 'ytv'];
handler.tags = ['downloader'];
handler.limit = true;
handler.premium = false;

export default handler;
