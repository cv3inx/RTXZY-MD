import axios from 'axios';
const handler = {
  help: ['umaru', 'kaneki', 'megumin', 'yotsuba', 'shinomiya', 'yumeko', 'tejina', 'chiho', 'toukachan', 'akira', 'itori', 'kurumi', 'sagiri', 'eba', 'deidara', 'itachi', 'madara', 'asuna', 'ayuzawa', 'chitoge', 'emilia', 'hestia', 'inori', 'ana', 'miku', 'kaori', 'shizuka', 'doraemon', 'kaga', 'kotori', 'mikasa', 'akiyama', 'gremory', 'isuzu', 'shina', 'kagura', 'shinka', 'tsunade', 'sasuke', 'sakura', 'rize', 'nezuko', 'boruto', 'naruto', 'erza', 'minato', 'elaina', 'yuri', 'shota', 'waifu', 'loli', 'hinata', 'husbu'],
  command: ['umaru', 'keneki', 'megumin', 'yotsuba', 'shinomiya', 'yumeko', 'tejina', 'chiho', 'toukachan', 'akira', 'itori', 'kurumi', 'sagiri', 'eba', 'deidara', 'itachi', 'madara', 'asuna', 'ayuzawa', 'chitoge', 'emilia', 'hestia', 'inori', 'ana', 'miku', 'kaori', 'shizuka', 'doraemon', 'kaga', 'koturi', 'mikasa', 'akiyama', 'gremory', 'isuzu', 'shina', 'kagura', 'shinka', 'tsunade', 'sasuke', 'sakura', 'rize', 'nezuko', 'boruto', 'naruto', 'erza', 'minato', 'elaina', 'yuri', 'shota', 'waifu', 'loli', 'hinata', 'husbu'],
  tags: ['image'],
  limit: true,
  run: async (m, { conn, args, usedPrefix, command, Api }) => {
    m.reply(wait);
    try {
      let url = Api.url(`/api/anime/${command}`);
      let response = await axios.get(url, { responseType: 'arraybuffer' });
      conn.sendFile(m.chat, response.data, '', '', m);
    } catch (e) {
      conn.reply(m.chat, eror, m);
    }
  }
};
export default handler;
