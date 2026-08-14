const handler = {
  help: ['bratgojo'],
  usage: 'teks',
  tags: ['maker'],
  command: 'bratgojo',
  limit: true,
  group: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) {
      throw `Masukkan teks yang ingin dijadikan gambar!\n\n*Contoh:*\n${usedPrefix + command} Gojo Comeback`;
    }

    try {
      m.reply(`⏳ Tunggu sebentar, sedang membuat gambar...`);
      let apiUrl = Api.url('/api/maker/canvas-bratGojo', { text });
      await conn.sendFile(m.chat, apiUrl, 'bratgojo.jpg', 'Done!', m);
    } catch (e) {
      console.log(e);
      throw eror;
    }
  }
};

export default handler;
