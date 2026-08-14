const handler = {
  command: ['lepton'],
  help: ['lepton'],
  tags: ['ai'],
  premium: false,
  limit: true,
  run: async (m, { text, usedPrefix, command, Api }) => {
    if (!text) throw `Masukkan pertanyaan!\n\n*Contoh:* Siapa presiden Indonesia? `;
    try {
      await m.reply(wait);
      let res = await (await Api.get('/api/search/lepton-ai', { text })).json();
      await m.reply(res.result.result);
    } catch (err) {
      console.error(err);
      throw eror;
    }
  }
};

export default handler;
