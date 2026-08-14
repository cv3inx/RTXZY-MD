const handler = {
  command: ['whois', 'whoislookup'],
  help: ['whois', 'whoislookup'],
  tags: ['tools'],
  premium: false,
  limit: true,
  run: async (m, { text, usedPrefix, command, Api }) => {
    if (!text) throw `Masukkan Domain!\n\n*Contoh:* botcahx.eu.org`;
    if (text.includes('https://') || text.includes('http://')) throw `Tolong masukkan tanpa domain *https/http!*. Contoh: botcahx.eu.org`;
    try {
      const waiting = `_Sedang mencari informasi WHOIS untuk ${text}..._`;
      m.reply(waiting);
      let data = Api.get('/api/webzone/whois', { query: text })
        .then((result) => result.json())
        .then((response) => {
          m.reply(response.result);
        })
        .catch((error) => {
          console.error(error);
          m.reply('Terjadi error saat mencari informasi WHOIS, silakan coba lagi nanti');
        });
    } catch (error) {
      console.error(error);
      m.reply('Terjadi error saat mencari informasi WHOIS, silakan coba lagi nanti');
    }
  }
};

export default handler;
