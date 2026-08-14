import uploader from '../../lib/media/uploadFile.js';
const handler = {
  help: ['audio2video'],
  tags: ['tools'],
  command: 'audio2video',
  limit: true,
  run: async (m, { conn, usedPrefix, command, Api }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || '';
    if (/audio/.test(mime)) {
      let buffer = await q.download();
      await m.reply(wait);
      try {
        let media = await uploader(buffer);
        let json = await (await Api.get('/api/tools/audio2video', { url: media })).json();
        await conn.sendFile(m.chat, json.result, 'video.mp4', '*DONE*', m);
      } catch (err) {
        throw eror;
      }
    } else throw `Reply audio with command ${usedPrefix + command}`;
  }
};

export default handler;
