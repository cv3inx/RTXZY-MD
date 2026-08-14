const handler = {
  help: ['facebook'],
  usage: '<url>',
  command: ['fb', 'facebook', 'facebookdl', 'fbdl', 'fbdown', 'dlfb'],
  tags: ['downloader'],
  limit: true,
  group: false,
  premium: false,
  owner: false,
  admin: false,
  botAdmin: false,
  fail: null,
  private: false,
  run: async (m, { conn, args, usedPrefix, command, Api }) => {
    if (!args[0]) throw `Gunakan contoh ${usedPrefix}${command} https://www.facebook.com/watch/?v=1393572814172251`;
    try {
      await m.reply(wait);
      const res = await Api.get('/api/dowloader/fbdown3', { url: args[0] });
      const json = await res.json();
      let urls = json.result.url.urls;
      if (!Array.isArray(urls)) {
        throw `Tidak dapat mendapatkan URL video dari tautan yang diberikan`;
      }
      for (let url of urls) {
        if (url.sd) {
          conn.sendFile(m.chat, url.sd, 'fb.mp4', `*Facebook Downloader*`, m);
          return;
        } else if (url.hd) {
          conn.sendFile(m.chat, url.hd, 'fb.mp4', `*Facebook Downloader*`, m);
          return;
        }
      }
      throw `Tidak ditemukan URL video SD atau HD`;
    } catch (error) {
      console.log(error);
      throw 'Terjadi kesalahan pada saat melakukan proses download';
    }
  }
};
export default handler;
