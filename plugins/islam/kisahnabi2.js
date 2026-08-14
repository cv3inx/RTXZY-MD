const handler = {
  help: ['kisahnabi2'],
  tags: ['islam'],
  command: /^(kisahnabi2)$/i,
  group: false,
  limit: true,
  run: async (m, { conn, usedPrefix, command, Api }) => {
    try {
      let res = await Api.get('/api/muslim/kisahnabi2');
      let json = await res.json();
      var _kn = [`―-KISAH NABI 2-―\n\n${json.result[0].name}\n\nTahun kelahiran: ${json.result[0].thn_kelahiran}\n\nUsia: ${json.result[0].usia}\n\n\nStory: ${json.result[0].description}`];
      conn.reply(m.chat, `${_kn}`);
    } catch (e) {
      throw eror;
    }
  }
};

export default handler;

//danaputra133
