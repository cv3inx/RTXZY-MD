const handler = {
  help: ['cekpenyakit'],
  tags: ['fun'],
  command: 'cekpenyakit',
  group: false,
  limit: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `Masukkan Tanggal Lahir!\n\ncontoh: ${usedPrefix + command} 14,05,2006`;

    try {
      let [part1] = text.split('|');
      let [tanggal1, bulan1, tahun1] = part1.split(',');

      await m.reply(wait);

      let res = await Api.get('/api/primbon/cekpenyakit', { tanggal: tanggal1, bulan: bulan1, tahun: tahun1 });
      let json = await res.json();
      let anu = [`―-CEK POTENSI PENYAKIT-―\n\nAnalisa: ${json.result.message.analisa}\n\nSektor: ${json.result.message.sektor}\n\nElemen: ${json.result.message.elemen}\n\nCatatan: ${json.result.message.catatan}`];
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
