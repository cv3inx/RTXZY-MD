const handler = {
  help: ['niatshubuh'],
  tags: ['islam'],
  command: /^(niatshubuh)$/i,
  group: false,
  limit: true,
  run: async (m, { conn, usedPrefix, command, Api }) => {
    try {
      let res = await Api.get('/api/muslim/niatshubuh');
      let json = await res.json();
      var sbh = [`―-NIAT SUBUH-―\n\n${json.result[0].name}\n\nArab: ${json.result[0].arabic}\n\nLatin: ${json.result[0].latin}\n\nTerjemahan: ${json.result[0].terjemahan}`];
      conn.reply(m.chat, `${sbh}`);
    } catch (e) {
      throw eror;
    }
  }
};

export default handler;

//danaputra133
