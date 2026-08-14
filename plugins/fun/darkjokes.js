const handler = {
  command: 'darkjokes',
  tags: ['fun'],
  help: ['darkjokes'],
  limit: true,
  run: async (m, { conn, text, Api }) => {
    try {
      let img = await Api.get('/api/random/darkjokes').then((result) => result.buffer());
      await conn.sendFile(m.chat, img, 'file.jpg', wm, m);
    } catch (e) {
      throw `Error ${eror}`;
    }
  }
};
export default handler;
