let handler = async (m, { conn, text, usedPrefix, command, Api }) => {
  if (!text) throw `Masukkan Nama!\n\ncontoh: ${usedPrefix + command} Budi`;
  try {
    await m.reply(wait);
    let res = await Api.get('/api/primbon/artinama', { nama: text });
    let json = await res.json();
    let anu = [`―-ARTI NAMA-―\n\nNama: ${json.result.message.nama}\n\nArti: ${json.result.message.arti}`];
    conn.reply(m.chat, `${anu}`);
  } catch (e) {
    throw eror;
  }
};

handler.help = ['artinama'];
handler.tags = ['fun'];
handler.command = /^(artinama)$/i;
handler.group = false;
handler.limit = true;

export default handler;

//danaputra133
