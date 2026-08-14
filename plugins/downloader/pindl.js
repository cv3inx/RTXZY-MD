const handler = {
  help: ['pindl'],
  command: /^(pindl|pin)$/i,
  tags: ['downloader'],
  limit: true,
  premium: false,
  run: async (m, { conn, args, usedPrefix, command, Api }) => {
    if (!args[0]) {
      throw `Masukkan URL!\n\ncontoh:\n${usedPrefix}${command} https://pin.it/4CVodSq`;
    }
    if (!args[0].startsWith('https://')) {
      throw `Harus memasukkan URL yang valid dengan format *https://*\n\nEx: https://pin.it/4CVodSq`;
    }
    try {
      m.reply(wait);
      const api = await Api.get('/api/download/pinterest', { url: args[0] });
      const res = await api.json();
      let { media_type, image, title, video } = res.result.data;
      if (media_type === 'video/mp4') {
        await conn.sendMessage(m.chat, { video: { url: video } });
      } else {
        conn.sendFile(m.chat, image, 'pindl.jpeg', `*Title:* ${title}\n*Mediatype:* ${media_type}\n*Source Url*: ${image}\n`, m);
      }
    } catch (e) {
      console.log(e);
      throw `Terjadi kesalahan!`;
    }
  }
};

export default handler;
