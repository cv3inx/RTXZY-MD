const handler = {
  help: ['arahrejeki'],
  tags: ['fun'],
  command: /^(arahrejeki)$/i,
  group: false,
  limit: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `Masukkan Tanggal Lahir!\n\ncontoh: ${usedPrefix + command} 14,05,2006`;

    try {
      let [part1] = text.split('|');
      let [tanggal1, bulan1, tahun1] = part1.split(',');

      await m.reply(wait);

      let res = await Api.get('/api/primbon/arahrejeki', { tanggal: tanggal1, bulan: bulan1, tahun: tahun1 });
      let json = await res.json();
      let anu = [`―-ARAH REJEKI-―\n\nHari lahir: ${json.result.message.hari_lahir}\n\nTanggal lahir: ${json.result.message.tgl_lahir}\n\nArah rejeki: ${json.result.message.arah_rejeki}\n\nCatatan: ${json.result.message.catatan}`];
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
