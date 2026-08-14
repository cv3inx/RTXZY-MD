const handler = {
  help: ['mulaiabsen'],
  usage: 'teks',
  tags: ['group'],
  command: ['startabsen', 'mulaiabsen'],
  group: true,
  admin: true,
  run: async (m, { conn, usedPrefix, text }) => {
    conn.absen = conn.absen ? conn.absen : {};
    let id = m.chat;
    if (id in conn.absen) {
      throw `_*Masih ada absen di chat ini!*_\n\n*${usedPrefix}hapusabsen* - untuk menghapus absen`;
    }
    conn.absen[id] = [m.reply(`Berhasil memulai absen!\n\n*${usedPrefix}absen* - untuk absen\n*${usedPrefix}cekabsen* - untuk mengecek absen\n*${usedPrefix}hapusabsen* - untuk menghapus data absen`), [], text];
  }
};
export default handler;
