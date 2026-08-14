import uploadImage from '../../lib/media/uploadImage.js';
import fetch from 'node-fetch';
let handler = async (m, { conn, usedPrefix, command, Api }) => {
  var q = m.quoted ? m.quoted : m;
  var mime = (q.msg || q).mimetype || q.mediaType || '';
  if (/image/g.test(mime) && !/webp/g.test(mime)) {
    await conn.reply(m.chat, wait, m);
    try {
      const img = await q.download?.();
      let out = await uploadImage(img);
      let old = new Date();
      let res = await Api.get('/api/maker/jadigta', { url: out });
      let convert = await res.json();
      let buff = await fetch(convert.result).then((result) => result.buffer());
      await conn.sendMessage(m.chat, { image: buff, caption: `🍟 *Fetching* : ${(new Date() - old) * 1} ms` }, { quoted: m });
    } catch (e) {
      console.log(e);
      m.reply(`[ ! ] Identifikasi Gagal.`);
    }
  } else {
    m.reply(`Kirim gambar dengan caption *${usedPrefix + command}* atau tag gambar yang sudah dikirim`);
  }
};
handler.help = handler.command = ['jadigta', 'togta'];
handler.tags = ['maker'];
handler.premium = false;
handler.limit = true;
export default handler;
