const handler = {
  help: ['drakememe'],
  usage: '<teks1|teks2>',
  tags: ['maker'],
  command: 'drakememe',
  limit: true,
  group: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    let guide = `Format salah!\n\n*Cara penggunaan:*\n${usedPrefix + command} teks atas|teks bawah\n\n*Contoh:*\n${usedPrefix + command} Belajar|Main Game`;

    if (!text) throw guide;

    let [teks1, teks2] = text.split('|');

    if (!teks1 || !teks2) {
      throw guide;
    }

    try {
      await m.reply('⏳ _Sedang memproses gambar..._');

      let apiUrl = Api.url('/api/maker/canvas-drakeMeme', { teks1: teks1.trim(), teks2: teks2.trim() });

      await conn.sendFile(m.chat, apiUrl, 'drakememe.jpg', 'Done!', m);
    } catch (e) {
      console.log(e);
      throw eror;
    }
  }
};

export default handler;
