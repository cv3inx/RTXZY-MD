import uploadImage from '../../lib/media/uploadImage.js';
import fetch from 'node-fetch';
const handler = {
  help: ['recolor'],
  command: ['recolor'],
  tags: ['maker'],
  premium: false,
  limit: 5,
  run: async (m, { conn, usedPrefix, command, Api }) => {
    var q = m.quoted ? m.quoted : m;
    var mime = (q.msg || q).mimetype || q.mediaType || '';
    if (/image/g.test(mime) && !/webp/g.test(mime)) {
      await conn.reply(m.chat, wait, m);
      try {
        const img = await q.download?.();
        let out = await uploadImage(img);
        let old = new Date();
        let res = await Api.get('/api/tools/recolor', { url: out });
        let convert = await res.json();
        let buff = await fetch(convert.result).then((res) => res.buffer());
        await conn.sendMessage(m.chat, { image: buff, caption: `🍟 *Fetching* : ${(new Date() - old) * 1} ms` }, { quoted: m });
      } catch (e) {
        console.log(e);
        m.reply(`[ ! ] Identifikasi Gagal.`);
      }
    } else {
      m.reply(`Kirim gambar dengan caption *${usedPrefix + command}* atau tag gambar yang sudah dikirim`);
    }
  }
};
export default handler;
