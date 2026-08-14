import uploadImage from '../../lib/media/uploadImage.js';
import fetch from 'node-fetch';
const handler = {
  help: ['tofigure', 'tofigure2', 'tofigure3'],
  command: ['tofigure', 'tofigure2', 'tofigure3'],
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

        if (command == 'tofigure') {
          let apiUrl = Api.url('/api/maker/tofigurev3', { url: out });
          let res = await fetch(apiUrl);
          let convert = await res.buffer();
          await conn.sendMessage(
            m.chat,
            {
              image: convert,
              caption: `🍟 *Fetching:* ${(new Date() - old) * 1} ms`
            },
            { quoted: m }
          );
        }

        if (command == 'tofigure2') {
          let apiUrl = Api.url('/api/maker/tofigurev2', { url: out });
          let res = await fetch(apiUrl);
          let convert = await res.buffer();
          await conn.sendMessage(
            m.chat,
            {
              image: convert,
              caption: `🍟 *Fetching:* ${(new Date() - old) * 1} ms`
            },
            { quoted: m }
          );
        }

        if (command == 'tofigure3') {
          let apiUrl = Api.url('/api/maker/tofigure', { url: out });
          let res = await fetch(apiUrl);
          let convert = await res.buffer();
          await conn.sendMessage(
            m.chat,
            {
              image: convert,
              caption: `🍟 *Fetching:* ${(new Date() - old) * 1} ms`
            },
            { quoted: m }
          );
        }
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
