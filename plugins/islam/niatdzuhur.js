const handler = {
  help: ['niatdzuhur'],
  tags: ['islam'],
  command: /^(niatdzuhur)$/i,
  group: false,
  limit: true,
  run: async (m, { conn, usedPrefix, command, Api }) => {
    try {
      let res = await Api.get('/api/muslim/niatdzuhur');
      let json = await res.json();
      var dzh = [`―-NIAT DZUHUR-―\n\n${json.result[0].name}\n\nArab: ${json.result[0].arabic}\n\nLatin: ${json.result[0].latin}\n\nTerjemahan: ${json.result[0].terjemahan}`];
      conn.reply(m.chat, `${dzh}`);
    } catch (e) {
      throw eror;
    }
  }
};

export default handler;

//danaputra133
