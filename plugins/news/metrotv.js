const handler = {
  help: ['metrotv'],
  tags: ['news'],
  command: 'metrotv',
  group: false,
  limit: true,
  run: async (m, { conn, Api }) => {
    try {
      let res = await Api.get('/api/news/metrotv');
      let json = await res.json();
      let items = json.result.filter((item) => item.berita && item.berita_url);
      let choice = pickRandom(items);
      let text = `―METROTV―\n\n*Judul*     : ${choice.berita}\n*URL*       : ${choice.berita_url}`;
      if (choice.berita_thumb) {
        try {
          await conn.sendMessage(m.chat, { image: { url: choice.berita_thumb }, caption: text }, { quoted: m });
        } catch (e) {
          conn.reply(m.chat, text, m);
        }
      } else {
        conn.reply(m.chat, text, m);
      }
    } catch (e) {
      throw eror;
    }
  }
};

export default handler;

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}
