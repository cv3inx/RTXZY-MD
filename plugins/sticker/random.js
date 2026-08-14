import { sticker5 } from '../../lib/media/sticker.js';
const handler = {
  command: ['dinokuning', 'patrick', 'spongebob', 'doge', 'manusialidi', 'sdino', 'spatrick', 'sspongebob', 'sdoge', 'smanusialidi'],
  help: ['dinokuning', 'patrick', 'spongebob', 'doge', 'manusialidi', 'sdino', 'spatrick', 'sspongebob', 'sdoge', 'smanusialidi'],
  tags: ['sticker'],
  limit: true,
  run: async (m, { conn, command, Api }) => {
    var error = `https://telegra.ph/file/12141dd462ecabeed1347.png`;
    try {
      if (command == 'dinokuning' || command == 'sdino') {
        const res = Api.url('/api/sticker/dinokuning');
        var stiker = await sticker5(res, { packname });
        await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
      } else if (command == 'patrick' || command == 'spatrick') {
        const res = Api.url('/api/sticker/patrick');
        var stiker = await sticker5(res, { packname });
        await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
      } else if (command == 'spongebob' || command == 'sspongebob') {
        const res = Api.url('/api/sticker/spongebob');
        var stiker = await sticker5(res, { packname });
        await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
      } else if (command == 'doge' || command == 'sdoge') {
        const res = Api.url('/api/sticker/doge');
        var stiker = await sticker5(res, { packname });
        await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
      } else if (command == 'manusialidi' || command == 'smanusialidi') {
        const res = Api.url('/api/sticker/manusialidi');
        var stiker = await sticker5(res, { packname });
        await conn.sendFile(m.chat, stiker, 'emror.webp', '', m);
      }
    } catch (e) {
      console.log(e);
      await conn.sendFile(m.chat, error, 'error.webp', '', m);
    }
  }
};

export default handler;
