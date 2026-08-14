const handler = {
  help: ['ramalanjodoh'],
  tags: ['fun'],
  command: /^(ramalanjodoh)$/i,
  group: false,
  limit: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `Masukkan Nama dan Tanggal Lahir!\n\ncontoh: ${usedPrefix + command} dani,14,05,2006|dini,12,09,2008`;

    try {
      let [part1, part2] = text.split('|');
      let [nama1, tanggal1, bulan1, tahun1] = part1.split(',');
      let [nama2, tanggal2, bulan2, tahun2] = part2.split(',');

      await m.reply(wait);

      let res = await Api.get('/api/primbon/ramalanjodoh', { nama1, tanggal1, bulan1, tahun1, nama2, tanggal2, bulan2, tahun2 });
      let json = await res.json();
      let anu = [`―-RAMALAN JODOH-―\n\nNama kamu: ${json.result.message.nama_anda.nama}\n\nTanggal lahir kamu:${json.result.message.nama_anda.tgl_lahir}\n\nPasangan kamu:${json.result.message.nama_pasangan.nama}Tanggal lahir pasangan kamu:\n\n${json.result.message.nama_pasangan.tgl_lahir}\n\nPenjelasan:${json.result.message.result}`];
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
