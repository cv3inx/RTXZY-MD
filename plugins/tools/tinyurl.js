const handler = {
  help: ['tinyurl'].map((v) => v + ' <link>'),
  tags: ['shortlink'],
  command: 'tinyurl',
  run: async (m, { text, usedPrefix, command, Api }) => {
    if (!text) throw `Masukan url/link!\n ${usedPrefix + command} https://google.com`;
    let res = await Api.get('/api/linkshort/tinyurl', { link: text });
    let json = await res.json();
    if (json.status) m.reply(json.result);
    else throw 'Link Invalid!\nPeriksa url anda';
  }
};

export default handler;
