const handler = {
  help: ['wirid'],
  tags: ['islam'],
  command: 'wirid',
  group: false,
  limit: true,
  run: async (m, { conn, usedPrefix, command, Api }) => {
    try {
      await m.reply(wait);
      let res = await Api.get('/api/muslim/wirid');
      let json = await res.json();
      var wrd = [`―-WIRID-―\n\nId: ${json.result.data[0].id}\n\nWaktu: ${json.result.data[0].times}\n\nArabic: ${json.result.data[0].arabic}`, `―-WIRID-―\n\nId: ${json.result.data[1].id}\n\nWaktu: ${json.result.data[1].times}\n\nArabic: ${json.result.data[1].arabic}`, `―-WIRID-―\n\nId: ${json.result.data[2].id}\n\nWaktu: ${json.result.data[2].times}\n\nArabic: ${json.result.data[2].arabic}`];
      conn.reply(m.chat, `${pickRandom(wrd)}`);
    } catch (e) {
      throw eror;
    }
  }
};

export default handler;

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}

//danaputra133
