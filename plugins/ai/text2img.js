const handler = {
  command: ['text2img'],
  help: ['text2img'],
  tags: ['ai'],
  limit: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `🚩 *Masukan detail gambar!* `;
    try {
      conn.reply(m.chat, wait, m);
      const res = await Api.get('/api/maker/text2img', { text }).then((res) => res.buffer());
      conn.sendFile(m.chat, res, 'image.jpg', `Result: ${text}`, m);
    } catch (error) {
      m.reply(`Error: ${eror}`);
    }
  }
};

export default handler;
