const handler = {
  help: ['carigrup'],
  usage: 'pencarian',
  tags: ['tools'],
  command: ['carigrup', 'carigroup', 'carigc'],
  limit: true,
  run: async (m, { text, usedPrefix, command, Api }) => {
    if (!text) throw `uhm.. cari apa?\n\ncontoh:\n${usedPrefix + command} mabar`;
    try {
      await m.reply(wait);
      const response = await Api.get('/api/search/linkgroupwa', { text1: text });
      const data = await response.json();
      if (!data.result || data.result.length === 0) throw 'Group tidak ditemukan ¯\\_(ツ)_/¯';
      const teks = data.result.map((group) => group.title + '\n' + group.link).join('\n\n');
      m.reply(teks);
    } catch (error) {
      console.error(error);
      throw eror;
    }
  }
};

export default handler;
