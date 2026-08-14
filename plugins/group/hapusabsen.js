const handler = {
  help: ['hapusabsen'],
  tags: ['group'],
  command: ['deleteabsen', 'hapusabsen'],
  group: true,
  admin: true,
  run: async (m, { conn, usedPrefix }) => {
    let id = m.chat;
    conn.absen = conn.absen ? conn.absen : {};
    if (!(id in conn.absen)) throw `_*Tidak ada absen berlangsung digrup ini!*_\n\n*${usedPrefix}mulaiabsen* - untuk memulai absen`;
    delete conn.absen[id];
    m.reply(`Done!`);
  }
};
export default handler;
