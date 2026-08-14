const handler = {
  help: ['bucin', 'ilham', 'dilan', 'fiersa', 'fakta', 'nyindir', 'ngawur', 'jawa', 'quotes', 'sunda', 'batak', 'aceh', 'cina', 'minangkabau'],
  tags: ['quotes'],
  command: ['bucin', 'ilham', 'dilan', 'fiersa', 'fakta', 'nyindir', 'ngawur', 'jawa', 'quotes', 'sunda', 'batak', 'aceh', 'cina', 'minangkabau'],
  owner: false,
  mods: false,
  premium: false,
  group: false,
  private: false,
  register: false,
  admin: false,
  botAdmin: false,
  fail: null,
  run: async (m, { conn, command, Api }) => {
    try {
      let anu = `─────〔 *${command}* 〕─────\n`;

      if (command === 'bucin') {
        const res = await (await Api.get('/api/random/katabucin')).json();
        anu += res.bucin;
      } else if (command === 'fiersa') {
        const res = await (await Api.get('/api/random/fiersa')).json();
        anu += res.fiersa;
      } else if (command === 'fakta') {
        const res = await (await Api.get('/api/random/fakta')).json();
        anu += res.result;
      } else if (command === 'nyindir') {
        const res = await (await Api.get('/api/random/nyindir')).json();
        anu += res.hasl;
      } else if (command === 'ngawur') {
        const res = await (await Api.get('/api/random/ngawur')).json();
        anu += res.hasl;
      } else if (command === 'jawa') {
        const res = await (await Api.get('/api/random/quotesjawa')).json();
        anu += res.quotes;
      } else if (command === 'quotes') {
        const res = await (await Api.get('/api/random/quotes')).json();
        anu += res.quotes;
      } else if (command === 'sunda') {
        const res = await (await Api.get('/api/random/sunda')).json();
        anu += res.hasl;
      } else if (command === 'batak') {
        const res = await (await Api.get('/api/random/batak')).json();
        anu += res.hasl;
      } else if (command === 'aceh') {
        const res = await (await Api.get('/api/random/aceh')).json();
        anu += res.hasl;
      } else if (command === 'cina') {
        const res = await (await Api.get('/api/random/china')).json();
        anu += res.hasl;
      } else if (command === 'minangkabau') {
        const res = await (await Api.get('/api/random/minangkabau')).json();
        anu += res.hasl;
      } else if (command === 'ilham') {
        const res = await (await Api.get('/api/random/katailham')).json();
        anu += res.hasil;
      } else if (command === 'dilan') {
        const res = await (await Api.get('/api/random/katadilan')).json();
        anu += res.dilan;
      }

      m.reply(anu);
    } catch (e) {
      throw eror;
    }
  }
};

export default handler;
