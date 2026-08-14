let handler = async (m, { conn, text, Api }) => {
  try {
    let img = await Api.get('/api/random/meme').then((result) => result.buffer());
    await conn.sendFile(m.chat, img, 'file.jpg', wm, m);
  } catch (e) {
    throw `Error ${eror}`;
  }
};
handler.command = /^(meme)$/i;
handler.tags = ['fun'];
handler.help = ['meme'];
handler.limit = true;
export default handler;
