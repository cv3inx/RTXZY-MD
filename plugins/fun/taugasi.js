import fetch from 'node-fetch';

const handler = {
  help: ['taugasih'],
  tags: ['fun'],
  command: /^(taugasih)$/i,
  limit: true,
  admin: false,
  fail: null,
  run: async (m, { conn, Api }) => {
    let res = await Api.get('/api/random/taugasih').then((result) => result.json());
    conn.reply(m.chat, `“${res.taugasih}”`, m);
  }
};

export default handler;
