let handler = async (m, { conn, text, usedPrefix, command, Api }) => {
  if (!text) throw `🚩 *Masukan detail gambar!* `;
  try {
    conn.reply(m.chat, wait, m);
    const res = await Api.get('/api/maker/text2img', { text }).then((res) => res.buffer());
    conn.sendFile(m.chat, res, 'image.jpg', `Result: ${text}`, m);
  } catch (error) {
    m.reply(`Error: ${eror}`);
  }
};

handler.command = handler.help = ['text2img'];
handler.tags = ['ai'];
handler.limit = true;
export default handler;
