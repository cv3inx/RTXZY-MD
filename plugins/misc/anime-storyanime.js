let handler = async (m, { conn, Api }) => {
  try {
    conn.reply(m.chat, wait, m);
    let res = await Api.get('/api/download/storyanime');
    let json = await res.json();
    conn.sendFile(m.chat, json.result.url, 'anime_story.mp4', '*STORY ANIME*', m);
  } catch (e) {
    throw `*Error:* ${eror}`;
  }
};

handler.help = ['storyanime'];
handler.tags = ['downloader'];
handler.command = /^(storyanime)$/i;
handler.limir = true;
export default handler;
