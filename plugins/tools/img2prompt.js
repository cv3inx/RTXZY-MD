import uploadImage from '../../lib/media/uploadImage.js';
const handler = {
  help: ['img2prompt'],
  command: ['img2prompt'],
  tags: ['tools'],
  premium: false,
  limit: true,
  run: async (m, { conn, usedPrefix, command, Api }) => {
    var q = m.quoted ? m.quoted : m;
    var mime = (q.msg || q).mimetype || q.mediaType || '';
    if (/image/g.test(mime) && !/webp/g.test(mime)) {
      await conn.reply(m.chat, wait, m);
      try {
        const img = await q.download?.();
        let out = await uploadImage(img);
        let data = await (await Api.get('/api/tools/img2prompt', { url: out })).json();
        await m.reply(data.result);
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
