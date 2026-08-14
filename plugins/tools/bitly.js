const handler = {
  help: ['bitly'],
  usage: 'link',
  tags: ['shortlink'],
  command: 'bitly',
  run: async (m, { text, Api }) => {
    if (!text) throw 'Masukan url/link nya mana?\n> .bitly https://google.com';
    let res = await Api.get('/api/linkshort/bitly', { link: text });
    let json = await res.json();
    if (json.status) m.reply(json.result);
    else throw 'Link Invalid!\nPeriksa url anda';
  }
};

export default handler;
