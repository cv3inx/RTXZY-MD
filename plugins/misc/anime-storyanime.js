const handler = {
  help: ['storyanime'],
  tags: ['downloader'],
  command: /^(storyanime)$/i,
  limir: true,
  run: async (m, { conn, Api }) => {
    try {
      conn.reply(m.chat, wait, m);
      let res = await Api.get('/api/download/storyanime');
      let json = await res.json();
      conn.sendFile(m.chat, json.result.url, 'anime_story.mp4', '*STORY ANIME*', m);
    } catch (e) {
      throw `*Error:* ${eror}`;
    }
  }
};

export default handler;
