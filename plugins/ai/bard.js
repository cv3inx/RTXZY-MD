let handler = async (m, { text, usedPrefix, command, Api }) => {
  if (!text) throw `Masukkan pertanyaan!\n\n*Contoh:* Siapa presiden Indonesia? `;
  try {
    await m.reply(wait);
    let res = await (await Api.get('/api/search/bard-ai', { text })).json();
    await m.reply(res.message);
  } catch (err) {
    console.error(err);
    throw eror;
  }
};
handler.command = handler.help = ['bard', 'bardai', 'gemini'];
handler.tags = ['ai'];
handler.premium = false;
handler.limit = true;
export default handler;
