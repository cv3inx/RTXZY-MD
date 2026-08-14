import fetch from 'node-fetch';

let handler = async (m, { conn, Api }) => {
  let res = await Api.get('/api/random/taugasih').then((result) => result.json());
  conn.reply(m.chat, `“${res.taugasih}”`, m);
};

handler.help = ['taugasih'];
handler.tags = ['fun'];
handler.command = /^(taugasih)$/i;
handler.limit = true;
handler.admin = false;
handler.fail = null;

export default handler;
