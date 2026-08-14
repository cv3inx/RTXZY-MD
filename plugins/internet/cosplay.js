let handler = async (m, { conn, Api }) => {
  try {
    const response = await Api.get('/api/wallpaper/cosplay');
    const buffer = await response.buffer();
    conn.sendFile(m.chat, buffer, 'hasil.jpg', 'Random Cosplay', m);
  } catch (err) {
    throw eror;
  }
};

handler.help = handler.command = ['cosplay'];
handler.tags = ['internet'];
handler.limit = true;

export default handler;
