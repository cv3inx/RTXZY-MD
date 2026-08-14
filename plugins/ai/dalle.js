const handler = {
  command: ['aiimg', 'aiimage', 'ai-image', 'dalle'],
  help: ['aiimg', 'aiimage', 'ai-image', 'dalle'],
  tags: ['ai'],
  limit: true,
  run: async (m, { text, command, conn, Api }) => {
    if (!text) throw 'Masukan teks untuk diubah menjadi gambar';
    try {
      let response = await Api.get('/api/search/openai-image', { text });
      let image = await response.buffer();
      conn.sendFile(m.chat, image, 'aiimg.jpg', wm, m);
    } catch (e) {
      throw `Error: ${eror}`;
    }
  }
};

export default handler;
