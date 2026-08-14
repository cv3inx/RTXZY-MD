const handler = {
  help: ['wetonjawa'],
  tags: ['fun'],
  command: 'wetonjawa',
  group: false,
  limit: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `Masukkan Tanggal Lahir!\n\ncontoh: ${usedPrefix + command} 14,05,2006`;

    try {
      let [part1] = text.split('|');
      let [tanggal1, bulan1, tahun1] = part1.split(',');

      await m.reply(wait);

      let res = await Api.get('/api/primbon/wetonjawa', { tanggal: tanggal1, bulan: bulan1, tahun: tahun1 });
      let json = await res.json();
      let anu = [`―-WETON JAWA-―\n\nTanggal: ${json.result.message.tanggal}\n\nJumlah neptu: ${json.result.message.jumlah_neptu}\n\nWatak hari: ${json.result.message.watak_hari}\n\nNaga hari: ${json.result.message.naga_hari}\n\nJam balik: ${json.result.message.jam_baik}\n\nWatak kelahiran: ${json.result.message.watak_kelahiran}`];
      if (json.status) {
        conn.reply(m.chat, `${anu}`);
      } else {
        conn.reply(m.chat, `Maaf, terjadi kesalahan`, m);
      }
    } catch (e) {
      throw eror;
    }
  }
};

export default handler;

//danaputra133
//di bantu erlan aka
