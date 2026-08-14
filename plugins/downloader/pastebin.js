const handler = {
  command: ['pastebindl', 'pastebin'],
  tags: ['downloader'],
  help: ['pastebindl', 'pastebin'],
  usage: 'url',
  limit: true,
  run: async (m, { text, usedPrefix, command, Api }) => {
    if (!text) throw `Masukkan URL Pastebin!\n\n*Contoh:* ${usedPrefix + command} https://pastebin.com/z77zNeZb`;

    try {
      await m.reply(wait);
      let res = await Api.get('/api/download/pastebin', { url: text });
      let json = await res.json();

      if (!json.status) throw '❌ Gagal mengambil data dari Pastebin!';

      await m.reply(`📄 *Hasil Pastebin:*\n\n${json.result}`);
    } catch (e) {
      console.error(e);
      throw '❌ Terjadi kesalahan saat mengambil data dari Pastebin!';
    }
  }
};

export default handler;
