const handler = {
  command: ['checkexp', 'cekexp'],
  help: ['checkexp', 'cekexp'],
  tags: ['main'],
  private: true,
  owner: true,
  rowner: true,
  run: async (m, { text, Api }) => {
    if (!text) throw `Masukan Username Di Website`;
    try {
      let api = await Api.get('/api/checkexp', { username: text });
      let body = await api.text();
      m.reply(body);
    } catch (e) {
      console.log(e);
      m.reply('Username tidak terdaftar!');
    }
  }
};
export default handler;
