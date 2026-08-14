const handler = {
  command: ['checkredirect', 'cekredirect'],
  help: ['checkredirect', 'cekredirect'],
  tags: ['tools'],
  limit: true,
  run: async (m, { text, usedPrefix, command, Api }) => {
    if (!text) throw `Masukkan URL yang ingin diperiksa!\n\n*Contoh:* ${usedPrefix + command} https://tinyurl.com/bdtf7se9`;

    try {
      await m.reply(wait);
      let res = await (await Api.get('/api/tools/cekredirect', { url: text })).json();

      if (!res.status || !res.result) throw 'Gagal mendapatkan data!';

      let message = res.result.map((item, index) => `🔗 *URL*: ${item.url}\n🚦 *Status*: ${item.status || 'Tidak ada status'}`).join('\n\n');

      await m.reply(message);
    } catch (e) {
      console.error(e);
      throw 'Terjadi kesalahan saat memproses permintaan!';
    }
  }
};

export default handler;
