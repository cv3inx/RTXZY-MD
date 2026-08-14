const handler = {
  help: ['niatisya'],
  tags: ['islam'],
  command: 'niatisya',
  group: false,
  limit: true,
  run: async (m, { conn, usedPrefix, command, Api }) => {
    try {
      let res = await Api.get('/api/muslim/niatisya');
      let json = await res.json();
      var isy = [`―-NIAT ISYA-―\n\n${json.result[0].name}\n\nArab: ${json.result[0].arabic}\n\nLatin: ${json.result[0].latin}\n\nTerjemahan: ${json.result[0].terjemahan}`];
      conn.reply(m.chat, `${isy}`);
    } catch (e) {
      throw eror;
    }
  }
};

export default handler;

//danaputra133
