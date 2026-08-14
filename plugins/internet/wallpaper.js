const handler = {
  tags: ['internet'],
  help: ['wallpaper'],
  command: /^(wallpaper)$/i,
  limit: true,
  run: async (m, { conn, Api }) => {
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
  }
};

export default handler;
