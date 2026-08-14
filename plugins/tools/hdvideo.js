import uploadImage from '../../lib/media/uploadImage.js';
const handler = {
  help: ['hdvideo', 'hdvid'],
  tags: ['tools'],
  command: ['hdvideo', 'hdvid'],
  premium: false,
  limit: true,
  run: async (m, { conn, usedPrefix, command, Api }) => {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';
    if (/^video/.test(mime)) {
      await conn.reply(m.chat, wait, m); // Added wait message
      try {
        const img = await q.download();
        const out = await uploadImage(img); // Assuming uploadImage is correct
        const api = await Api.get('/api/tools/hdvideo', { url: out });
        const video = await api.json();
        const { url } = video;
        conn.sendFile(m.chat, url, null, wm, m);
      } catch (e) {
        console.error(e);
        m.reply(`Identifikasi gagal. Silakan coba lagi.`);
      }
    } else {
      m.reply(`Kirim Video dengan caption *${usedPrefix + command}* atau tag Video yang sudah dikirim.`);
    }
  }
};

export default handler;
