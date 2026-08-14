import uploader from '../../lib/media/uploadFile.js';
let handler = async (m, { conn, usedPrefix, command, Api }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || q.mediaType || '';
  if (/audio/.test(mime)) {
    let buffer = await q.download();
    await m.reply(wait);
    try {
      let fileSizeLimit = 5 * 1024 * 1024;
      if (buffer.length > fileSizeLimit) {
        throw 'Ukuran media tidak boleh melebihi 5MB';
      }
      let media = await uploader(buffer);
      let response = await Api.get('/api/tools/voiceremover', { url: media });
      let res = await response.json();
      if (!res.status) {
        throw null;
      }
      if (command === 'vocalremover') {
        await conn.sendMessage(m.chat, { audio: { url: res.result.instrumental_path }, mimetype: 'audio/mpeg' }, { quoted: m });
      } else if (command === 'instrumenremover') {
        await conn.sendMessage(m.chat, { audio: { url: res.result.vocal_path }, mimetype: 'audio/mpeg' }, { quoted: m });
      }
    } catch (e) {
      throw '*[INTERNAL SERVER ERROR!]*';
    }
  } else {
    await m.reply(`Reply *audio* with command ${usedPrefix + command}`);
  }
};

handler.command = handler.help = ['vocalremover', 'instrumenremover'];
handler.tags = ['tools'];
handler.limit = true;

export default handler;
