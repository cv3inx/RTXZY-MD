let handler = async (m, { conn, command, Api }) => {
  await conn.reply(m.chat, wait, m);
  try {
    if (command == 'gay') {
      const res = Api.url('/api/nsfw/gay');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'ahegao') {
      const res = Api.url('/api/nsfw/ahegao');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'ass') {
      const res = Api.url('/api/nsfw/ass');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'bdsm') {
      const res = Api.url('/api/nsfw/bdsm');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'blowjob') {
      const res = Api.url('/api/nsfw/blowjob');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'cuckold') {
      const res = Api.url('/api/nsfw/cuckold');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'cum') {
      const res = Api.url('/api/nsfw/cum');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'ero') {
      const res = Api.url('/api/nsfw/ero');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'femdom') {
      const res = Api.url('/api/nsfw/femdom');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'foot') {
      const res = Api.url('/api/nsfw/foot');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'gangbang') {
      const res = Api.url('/api/nsfw/gangbang');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'glasses') {
      const res = Api.url('/api/nsfw/glasses');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'hentai') {
      const res = Api.url('/api/nsfw/hentai');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'gifs') {
      const res = Api.url('/api/nsfw/gifs');
      await conn.sendFile(m.chat, res, null, '', m);
    }
    if (command == 'jahy') {
      const res = Api.url('/api/nsfw/jahy');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'manga') {
      const res = Api.url('/api/nsfw/manga');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'masturbation') {
      const res = Api.url('/api/nsfw/masturbation');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'neko') {
      const res = Api.url('/api/nsfw/neko');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'neko2') {
      const res = Api.url('/api/nsfw/neko2');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'orgy') {
      const res = Api.url('/api/nsfw/orgy');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'panties') {
      const res = Api.url('/api/nsfw/panties');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'pussy') {
      const res = Api.url('/api/nsfw/pussy');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'tentacles') {
      const res = Api.url('/api/nsfw/tentacles');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'yuri2') {
      const res = Api.url('/api/nsfw/yuri');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'thighs') {
      const res = Api.url('/api/nsfw/thighs');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'zettai') {
      const res = Api.url('/api/nsfw/zettai');
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
  } catch (err) {
    console.error(err);
    throw '🚩 Terjadi kesalahan';
  }
};
handler.command = handler.help = ['gay', 'ahegao', 'ass', 'bdsm', 'blowjob', 'cuckold', 'cum', 'ero', 'femdom', 'foot', 'gangbang', 'glasses', 'hentai', 'gifs', 'jahy', 'manga', 'masturbation', 'neko', 'neko2', 'orgy', 'tentacles', 'pussy', 'panties', 'thighs', 'yuri2', 'zettai'];
handler.tags = ['nsfw'];
handler.limit = true;
handler.premium = true;
handler.nsfw = true;
export default handler;
