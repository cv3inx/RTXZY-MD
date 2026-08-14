const handler = {
  help: ['cuttly'].map((v) => v + ' <link>'),
  tags: ['shortlink'],
  command: 'cuttly',
  run: async (m, { text, Api }) => {
    if (!text) throw 'Masukan url/link nya mana?\n> .cuttly https://googe.com';
    let res = await Api.get('/api/linkshort/cuttly', { link: text });
    let json = await res.json();
    if (json.status) m.reply(json.result);
    else throw 'Link Invalid!\nPeriksa url anda';
  }
};

export default handler;
