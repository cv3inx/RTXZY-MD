const handler = {
  help: ['niatmaghrib'],
  tags: ['islam'],
  command: /^(niatmaghrib)$/i,
  group: false,
  limit: true,
  run: async (m, { conn, usedPrefix, command, Api }) => {
    try {
      let res = await Api.get('/api/muslim/niatmaghrib');
      let json = await res.json();
      var mgh = [`―-NIAT MAGRIB-―\n\n${json.result[0].name}\n\nArab: ${json.result[0].arabic}\n\nLatin: ${json.result[0].latin}\n\nTerjemahan: ${json.result[0].terjemahan}`];
      conn.reply(m.chat, `${mgh}`);
    } catch (e) {
      throw eror;
    }
  }
};

export default handler;

//danaputra133
