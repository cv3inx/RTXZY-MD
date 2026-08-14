const handler = {
  command: ['xnxxdown'],
  help: ['xnxxdown'],
  tags: ['internet'],
  limit: true,
  premium: true,
  run: async (m, { text, usedPrefix, command, Api }) => {
    if (!text) throw 'Masukkan Query Link!';
    try {
      let anu = await Api.get('/api/download/xnxxdl', { url: text });
      let hasil = await anu.json();

      conn.sendMessage(m.chat, { video: { url: hasil.result.url }, fileName: 'xnxx.mp4', mimetype: 'video/mp4' }, { quoted: m });
    } catch (e) {
      throw `*Server error!*`;
    }
  }
};

export default handler;
