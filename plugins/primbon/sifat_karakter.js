const handler = {
  help: ['sifatkarakter'],
  tags: ['fun'],
  command: 'sifatkarakter',
  group: false,
  limit: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `Masukkan Tanggal Lahir!\n\ncontoh: ${usedPrefix + command} dani,14,05,2006`;

    try {
      let [part1] = text.split('|');
      let [nama, tanggal1, bulan1, tahun1] = part1.split(',');

      await m.reply(wait);

      let res = await Api.get('/api/primbon/sifatkarakter', { nama, tanggal: tanggal1, bulan: bulan1, tahun: tahun1 });
      let json = await res.json();
      let anu = [`―-SIFAT KARAKTER-―\n\nNama: ${json.result.message.nama}\n\nTanggal lahir: ${json.result.message.tgl_lahir}\n\nGaris hidup: ${json.result.message.garis_hidup}`];
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
