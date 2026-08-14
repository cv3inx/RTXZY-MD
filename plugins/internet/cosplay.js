const handler = {
  help: ['cosplay'],
  command: ['cosplay'],
  tags: ['internet'],
  limit: true,
  run: async (m, { conn, Api }) => {
    try {
      const response = await Api.get('/api/wallpaper/cosplay');
      const buffer = await response.buffer();
      conn.sendFile(m.chat, buffer, 'hasil.jpg', 'Random Cosplay', m);
    } catch (err) {
      throw eror;
    }
  }
};

export default handler;
