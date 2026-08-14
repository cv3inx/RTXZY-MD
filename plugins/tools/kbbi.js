const handler = {
  command: ['kbbi', 'carikata', 'kamus'],
  help: ['kbbi', 'carikata', 'kamus'],
  tags: ['tools'],
  limit: true,
  run: async (m, { text, usedPrefix, command, Api }) => {
    if (!text) throw `*Example:* ${usedPrefix + command} pohon`;
    m.reply(wait);
    try {
      let res = await (await Api.get('/api/search/kbbi', { text })).json();
      let content = `*K A M U S  B E S A R  B A H A S A  I N D O N E S I A*\n\n`;

      if (res.status && res.result) {
        content += `  ◦ *Kata:* ${res.result.lema}\n\n`;

        for (let [key, value] of Object.entries(res.result)) {
          if (key !== 'lema' && Array.isArray(value) && value.length > 0) {
            content += `*${key.charAt(0).toUpperCase() + key.slice(1)}:*\n`;
            for (let i of value) content += `  • ${i}\n`;
            content += `\n`;
          }
        }
      } else {
        content += 'Kata tidak ditemukan di KBBI.';
      }

      await m.reply(content);
    } catch (error) {
      throw eror;
    }
  }
};

export default handler;
