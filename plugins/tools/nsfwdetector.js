import uploader from '../../lib/media/uploadImage.js';
const handler = {
  help: ['nsfwdetector', 'nsfwdetect'],
  tags: ['tools'],
  command: ['nsfwdetector', 'nsfwdetect'],
  limit: true,
  group: true,
  run: async (m, { conn, command, usedPrefix, Api }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || '';
    if (/image/g.test(mime) && !/webp/g.test(mime)) {
      let buffer = await q.download();
      await m.reply(wait);
      try {
        let media = await uploader(buffer);
        let res = await (await Api.get('/api/tools/nsfw-detect', { url: media })).json();
        if (res.status) {
          let { labelName, labelId, confidence } = res.result;
          let capt;
          capt = `乂 *N S F W D E T E C T O R*\n\n`;
          capt += `◦ *Label Name* : ${labelName}\n`;
          capt += `◦ *Label Id* : ${labelId}\n`;
          capt += `◦ *Confidence* : ${confidence}\n`;
          m.reply(capt);
        }
      } catch (err) {
        throw eror;
      }
    } else {
      throw `Reply image with command ${usedPrefix + command}`;
    }
  }
};

export default handler;
