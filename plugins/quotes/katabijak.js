const handler = {
  help: ['katabijak'],
  tags: ['quotes'],
  command: 'katabijak',
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
    const res = await Api.get('/api/random/bijak').then((result) => result.json());

    let anu = `─────〔 *Kata Bijak* 〕─────

${res.result}
`;
    m.reply(anu);
  }
};

export default handler;
