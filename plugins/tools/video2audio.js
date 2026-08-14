import uploader from '../../lib/media/uploadFile.js';
const handler = {
  help: ['video2audio'],
  tags: ['tools'],
  command: 'video2audio',
  limit: true,
  run: async (m, { conn, usedPrefix, command, Api }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || '';
    if (/video/.test(mime)) {
      let buffer = await q.download();
      await m.reply(wait);
      try {
        let media = await uploader(buffer);
        let json = await (await Api.get('/api/tools/video2audio', { url: media })).json();
        await conn.sendFile(m.chat, json.result, 'audio.mp3', '*DONE*', m);
      } catch (err) {
        throw eror;
      }
    } else throw `Reply video with command ${usedPrefix + command}`;
  }
};

export default handler;
