import { toPTT, toAudio } from '../../lib/media/converter.js';

const handler = {
  help: ['toaudio (reply)'],
  tags: ['tools'],
  command: /^to(a(udio)?)$/i,
  run: async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (m.quoted ? m.quoted : m.msg).mimetype || '';
    if (!/video|audio/.test(mime)) throw `Balas video/audio dengan perintah *${usedPrefix + command}*`;
    let media = await q.download();
    if (!media) throw 'Media tidak dapat diunduh';
    let audio = await toAudio(media, 'mp4');
    if (!audio.data) throw 'Gagal melakukan konversi.';
    conn.sendMessage(m.chat, { audio: { url: audio.filename }, mimetype: 'audio/mpeg' }, { quoted: m });
  }
};

export default handler;
