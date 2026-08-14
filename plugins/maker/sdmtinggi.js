import uploadImage from '../../lib/media/uploadImage.js';
const handler = {
  help: ['tosdmtinggi', 'sdmtinggi', 'sdm'],
  command: ['tosdmtinggi', 'sdmtinggi', 'sdm'],
  tags: ['maker'],
  premium: false,
  limit: true,
  run: async (m, { conn, usedPrefix, command, Api }) => {
    var q = m.quoted ? m.quoted : m;
    var mime = (q.msg || q).mimetype || q.mediaType || '';

    if (/image/g.test(mime) && !/webp/g.test(mime)) {
      await conn.reply(m.chat, '⏳ Sedang diproses...', m);
      try {
        const img = await q.download?.();
        let out = await uploadImage(img);
        let old = new Date();

        let img_url_api = await (await Api.get('/api/maker/jadisdmtinggi', { url: out })).buffer();
        await conn.sendMessage(
          m.chat,
          {
            image: img_url_api,
            caption: `🍟 *Fetching:* ${(new Date() - old) * 1} ms`
          },
          { quoted: m }
        );
      } catch (e) {
        console.error(e);
        m.reply('[ ! ] Terjadi kesalahan saat memproses gambar.');
      }
    } else {
      m.reply(`Kirim gambar dengan caption *${usedPrefix + command}* atau tag gambar yang sudah dikirim.`);
    }
  }
};

export default handler;
