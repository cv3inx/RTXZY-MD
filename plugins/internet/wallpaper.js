let handler = async (m, { conn, Api }) => {
  try {
    await m.reply(wait);
    let img = await (await Api.get('/api/wallpaper/wallhp')).buffer();
    await conn.sendMessage(
      m.chat,
      {
        image: img,
        caption: 'Berikut adalah wallpaper random untuk Anda!'
      },
      { quoted: m }
    );
  } catch (e) {
    throw eror;
  }
};

handler.tags = ['internet'];
handler.help = ['wallpaper'];
handler.command = /^(wallpaper)$/i;
handler.limit = true;

export default handler;
