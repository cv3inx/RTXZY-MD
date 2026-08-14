const handler = {
  help: ['carbon'],
  tags: ['maker'],
  command: ['carbon', 'carbonara'],
  limit: true,
  run: async (m, { conn, args, Api }) => {
    let text;
    if (args.length >= 1) {
      text = args.slice(0).join(' ');
    } else if (m.quoted && m.quoted.text) {
      text = m.quoted.text;
    } else throw 'Input teks atau reply teks yang ingin di jadikan carbon!';
    if (!text) return m.reply('masukan text');
    try {
      m.reply(wait);
      let img = await Api.get('/api/maker/carbon', { text }).then((res) => res.json());
      await conn.sendFile(m.chat, img.result, 'img.jpeg', '', m);
    } catch (e) {
      throw `${eror}`;
    }
  }
};

export default handler;
