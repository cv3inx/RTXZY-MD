let handler = async (m, { conn, text, usedPrefix, command, Api }) => {
  if (!text) throw `Masukkan Tanggal Lahir!\n\ncontoh: ${usedPrefix + command} 14,05,2006`;

  try {
    let [part1] = text.split('|');
    let [tanggal1, bulan1, tahun1] = part1.split(',');

    await m.reply(wait);

    let res = await Api.get('/api/primbon/nagahari', { tanggal: tanggal1, bulan: bulan1, tahun: tahun1 });
    let json = await res.json();
    let anu = [`―-RAHASIA NAGA HARI-―\n\nTanggal lahir: ${json.result.message.tgl_lahir}\n\nArah naga hari: ${json.result.message.arah_naga_hari}\n\nCatatan: ${json.result.message.catatan}`];
    if (json.status) {
      conn.reply(m.chat, `${anu}`);
    } else {
      conn.reply(m.chat, `Maaf, terjadi kesalahan`, m);
    }
  } catch (e) {
    throw eror;
  }
};

handler.help = ['nagahari'];
handler.tags = ['fun'];
handler.command = /^(nagahari)$/i;
handler.group = false;
handler.limit = true;

export default handler;

//danaputra133
//di bantu erlan aka
