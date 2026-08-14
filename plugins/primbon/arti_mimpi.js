const handler = {
  help: ['artimimpi'],
  tags: ['fun'],
  command: 'artimimpi',
  group: false,
  limit: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `Masukkan Mimpi kamu!\n\ncontoh: ${usedPrefix + command} mandi`;
    try {
      await m.reply(wait);
      let res = await Api.get('/api/primbon/artimimpi', { mimpi: text });
      let json = await res.json();
      let anu = [`―-ARTI MIMPI-―\n\nMimpi: ${json.result.message.mimpi}\n\nArti: ${json.result.message.arti}\n\nSolusi: ${json.result.message.solusi}`];
      conn.reply(m.chat, `${anu}`);
    } catch (e) {
      throw eror;
    }
  }
};

export default handler;
