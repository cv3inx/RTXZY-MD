const handler = {
  help: ['harisangar'],
  tags: ['fun'],
  command: /^(harisangar)$/i,
  group: false,
  limit: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `Masukkan Tanggal Lahir!\n\ncontoh: ${usedPrefix + command} 14,05,2006`;

    try {
      let [part1] = text.split('|');
      let [tanggal1, bulan1, tahun1] = part1.split(',');

      await m.reply(wait);

      let res = await Api.get('/api/primbon/harisangar', { tanggal: tanggal1, bulan: bulan1, tahun: tahun1 });
      let json = await res.json();
      let anu = [`―-HARI SANGAR TALIWANGKE-―\n\nTanggal lahir: ${json.result.message.tgl_lahir}\n\nHasil: ${json.result.message.result}\n\nInfo: ${json.result.message.info}\n\nCatatan: ${json.result.message.catatan}`];
      if (json.status) {
        conn.reply(m.chat, `${anu}`);
      } else {
        conn.reply(m.chat, `Maaf, terjadi kesalahan!`, m);
      }
    } catch (e) {
      throw eror;
    }
  }
};

export default handler;

//danaputra133
//di bantu erlan aka
