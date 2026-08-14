const handler = {
  help: ['bacot'],
  tags: ['quotes'],
  command: /^(bacot)$/i,
  owner: false,
  mods: false,
  premium: false,
  group: false,
  private: false,
  admin: false,
  botAdmin: false,
  fail: null,
  run: async (m, { conn, Api }) => {
    let res = await Api.get('/api/random/bacot').then((result) => result.json());
    let anu = `
─────〔 *Bacot* 〕─────

${res.hasl}
`;
    conn.reply(m.chat, anu, m);
  }
};

export default handler;
