import jimp from 'jimp';
import uploadImage from '../../lib/media/uploadImage.js';
import uploadFile from '../../lib/media/uploadFile.js';

const handler = {
  help: ['resize'],
  usage: '<width> <height> (reply|caption)',
  tags: ['tools'],
  command: 'resize',
  run: async (m, { conn, usedPrefix, args }) => {
    let toWidth = args[0];
    let toHeight = args[1];
    if (!toWidth) throw 'Please provide the width.';
    if (!toHeight) throw 'Please provide the height.';
    if (isNaN(toWidth) || isNaN(toHeight)) throw 'Width and height must be numbers.';
    let quotedMsg = m.quoted ? m.quoted : m;
    let mime = (quotedMsg.msg || quotedMsg).mimetype || '';
    if (!mime) throw 'Media not found.';

    let media = await quotedMsg.download();
    let isMedia = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime);
    if (!isMedia) throw `The "${mime}" type is not supported.`;
    let link = await (isMedia ? uploadImage : uploadImage)(media);
    let source = await jimp.read(await media);
    let size = {
      before: {
        height: await source.getHeight(),
        width: await source.getWidth()
      },
      after: {
        height: toHeight,
        width: toWidth
      }
    };
    let compres = await conn.resize(media, toWidth - 0, toHeight - 0);
    let linkCompres = await (isMedia ? uploadImage : uploadImage)(compres);
    conn.sendFile(
      m.chat,
      compres,
      null,
      `
• BEFORE
*+* Width : ${size.before.width}
*+* Height : ${size.before.height}

• AFTER
*+* Width : ${size.after.width}
*+* Height : ${size.after.height}

• LINK
*+* Original: ${link}
*+* Compressed: ${linkCompres}`,
      m
    );
  }
};

export default handler;
