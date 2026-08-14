const handler = {
  command: ['douyinslide', 'douyinfoto', 'ttslide', 'tiktokslide'],
  help: ['douyinslide', 'douyinfoto', 'ttslide', 'tiktokslide'],
  tags: ['downloader'],
  limit: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (command == 'tiktokslide' || command == 'ttslide') {
      if (!text) throw `Masukkan URL!\n\ncontoh: ${usedPrefix + command} https://vt.tiktok.com/ZSHGno9d2L4w1-thgJL/`;
      try {
        const api = await Api.get('/api/download/tiktokslide', { url: text });
        const res = await api.json();
        for (let i of res.result.images) {
          await sleep(3000);
          conn.sendMessage(m.chat, { image: { url: i }, caption: `*Title*: ${res.result.title}` }, { quoted: m });
        }
        conn.sendMessage(m.chat, { audio: { url: res.result.audio[0] }, mimetype: 'audio/mpeg' }, { quoted: m });
      } catch (e) {
        console.log(e);
        throw `🚩 *Terjadi kesalahan!*`;
      }
    }
    if (command == 'douyinslide' || command == 'douyinfoto') {
      if (!text) throw `Masukkan URL!\n\ncontoh: ${usedPrefix + command} https://v.douyin.com/i2bPkLLo/`;
      try {
        const api = await Api.get('/api/download/douyinslide', { url: text });
        const res = await api.json();
        for (let i of res.result.images) {
          await sleep(3000);
          conn.sendMessage(m.chat, { image: { url: i }, caption: `*Title*: ${res.result.title}` }, { quoted: m });
        }
        conn.sendMessage(m.chat, { audio: { url: res.result.audio[0] }, mimetype: 'audio/mpeg' }, { quoted: m });
      } catch (e) {
        console.log(e);
        throw `🚩 *Terjadi kesalahan!*`;
      }
    }
  }
};

export default handler;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
