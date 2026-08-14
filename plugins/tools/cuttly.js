let handler = async (m, { text, Api }) => {
  if (!text) throw 'Masukan url/link nya mana?\n> .cuttly https://googe.com';
  let res = await Api.get('/api/linkshort/cuttly', { link: text });
  let json = await res.json();
  if (json.status) m.reply(json.result);
  else throw 'Link Invalid!\nPeriksa url anda';
};
handler.help = ['cuttly'].map((v) => v + ' <link>');
handler.tags = ['shortlink'];
handler.command = /^cuttly2$/i;

export default handler;
