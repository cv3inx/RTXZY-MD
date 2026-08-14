const handler = {
  command: 'meme',
  tags: ['fun'],
  help: ['meme'],
  limit: true,
  run: async (m, { conn, text, Api }) => {
    try {
      let img = await Api.get('/api/random/meme').then((result) => result.buffer());
      await conn.sendFile(m.chat, img, 'file.jpg', wm, m);
    } catch (e) {
      throw `Error ${eror}`;
    }
  }
};
export default handler;
