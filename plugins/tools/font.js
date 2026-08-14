const handler = {
  help: ['font', 'styletext'].map((v) => v + ' <text>'),
  tags: ['tools'],
  command: ['font', 'styletext'],
  owner: false,
  mods: false,
  premium: false,
  group: false,
  private: false,
  admin: false,
  botAdmin: false,
  fail: null,
  limit: true,
  run: async (m, { text, usedPrefix, command, Api }) => {
    if (!text) throw `contoh:\n${usedPrefix + command} botcahx`;

    try {
      let json = await Api.get('/api/tools/styletext', { text });
      let data = await json.json();
      let caption = '';
      for (let x of data.result) {
        caption += `
${x.result}\n`;
      }
      return m.reply(caption);
    } catch (e) {
      console.log(e);
      throw `${eror}`;
    }
  }
};

export default handler;
