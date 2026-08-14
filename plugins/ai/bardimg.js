import fetch from 'node-fetch';
import uploader from '../../lib/media/uploadImage.js';
import uploadFile from '../../lib/media/uploadFile.js';
const handler = {
  help: ['bardimg', 'bardimage', 'bardvideo', 'bardaudio', 'geminiimg', 'geminiimage', 'geminivideo', 'geminiaudio'],
  tags: ['ai'],
  command: ['bardimg', 'bardimage', 'bardvideo', 'bardaudio', 'geminiimg', 'geminiimage', 'geminivideo', 'geminiaudio'],
  limit: true,
  run: async (m, { conn, text, command, usedPrefix, Api }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || '';
    let media, baseUrl;

    await m.reply(wait);

    try {
      if (/image/.test(mime) && !/webp/.test(mime)) {
        let buffer = await q.download();
        media = await uploader(buffer);
        baseUrl = Api.url('/api/search/bard-img', { url: media, text });
      } else if (/video/.test(mime)) {
        if (q.seconds > 60) throw 'Maximum video duration is 60 seconds!';
        let buffer = await q.download();
        media = await uploadFile(buffer);
        baseUrl = Api.url('/api/search/bard-video', { url: media, text });
      } else if (/audio/.test(mime)) {
        let buffer = await q.download();
        media = await uploadFile(buffer);
        baseUrl = Api.url('/api/search/bard-audio', { url: media, text });
      } else {
        throw `Kirim media dengan caption *${usedPrefix + command} pertanyaan* atau tag media yang sudah dikirim.`;
      }

      let json = await (await fetch(baseUrl)).json();
      if (json.status && json.result) {
        conn.sendMessage(m.chat, { text: json.result }, { quoted: m });
      } else {
        throw 'Failed to get response from Gemini!';
      }
    } catch (err) {
      console.error(err);
      throw `[ ! ] Terjadi kesalahan saat memproses media.\n\nKirim media dengan caption *${usedPrefix + command} pertanyaan* atau tag media yang sudah dikirim.`;
    }
  }
};

export default handler;
