const handler = {
  help: ['galau'],
  tags: ['quotes'],
  command: 'galau',
  owner: false,
  mods: false,
  premium: false,
  group: false,
  private: false,
  register: false,
  admin: false,
  botAdmin: false,
  fail: null,
  run: async (m, { conn, Api }) => {
    const res = await Api.get('/api/random/katasenja').then((result) => result.json());
    let anu = `─────〔 *Galau* 〕─────

${res.senja}
`;
    m.reply(anu);
  }
};

export default handler;
