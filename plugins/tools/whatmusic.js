import uploader from '../../lib/media/uploadFile.js';
let handler = async (m, { conn, usedPrefix, command, Api }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || q.mediaType || '';
  if (/video|audio/.test(mime)) {
    let buffer = await q.download();
    await m.reply(wait);
    try {
      let media = await uploader(buffer);
      let json = await (await Api.get('/api/tools/whatmusic', { url: media })).json();
      conn.sendMessage(m.chat, { text: json.result }, { quoted: m });
    } catch (err) {
      throw `${eror}`;
    }
  } else throw `Reply audio/video with command ${usedPrefix + command}`;
};
handler.help = ['whatmusic'];
handler.tags = ['tools'];
handler.command = /^(whatmusic)$/i;
handler.limit = true;

export default handler;
