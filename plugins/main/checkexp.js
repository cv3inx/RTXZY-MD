let handler = async (m, { text, Api }) => {
  if (!text) throw `Masukan Username Di Website`;
  try {
    let api = await Api.get('/api/checkexp', { username: text });
    let body = await api.text();
    m.reply(body);
  } catch (e) {
    console.log(e);
    m.reply('Username tidak terdaftar!');
  }
};
handler.command = handler.help = ['checkexp', 'cekexp'];
handler.tags = ['main'];
handler.private = true;
handler.owner = true;
handler.rowner = true;
export default handler;
