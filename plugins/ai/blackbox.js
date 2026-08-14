let handler = async (m, { text, usedPrefix, command, Api }) => {
  if (!text) throw `Masukkan pertanyaan!\n\n*Contoh:* buatkan saya code express.js`;
  try {
    await m.reply(wait);
    let res = await (await Api.get('/api/search/blackbox-chat', { text })).json();
    await m.reply(res.message);
  } catch (e) {
    throw eror;
  }
};
handler.command = handler.help = ['blackbox', 'blackboxai', 'aicoding'];
handler.tags = ['ai'];
handler.limit = true;

export default handler;
