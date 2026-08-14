const handler = {
  command: ['blackbox', 'blackboxai', 'aicoding'],
  help: ['blackbox', 'blackboxai', 'aicoding'],
  tags: ['ai'],
  limit: true,
  run: async (m, { text, usedPrefix, command, Api }) => {
    if (!text) throw `Masukkan pertanyaan!\n\n*Contoh:* buatkan saya code express.js`;
    try {
      await m.reply(wait);
      let res = await (await Api.get('/api/search/blackbox-chat', { text })).json();
      await m.reply(res.message);
    } catch (e) {
      throw eror;
    }
  }
};

export default handler;
