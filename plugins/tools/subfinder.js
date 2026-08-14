const handler = {
  command: ['subdomainfinder', 'subfinder'],
  help: ['subdomainfinder', 'subfinder'],
  tags: ['tools'],
  premium: false,
  limit: true,
  run: async (m, { text, usedPrefix, command, Api }) => {
    if (!text) throw `Masukkan Domain!\n\n*Contoh:* botcahx.eu.org`;
    if (text.includes('https://') || text.includes('http://')) throw `Tolong masukkan tanpa domain *https/http!*. Contoh: botcahx.eu.org`;

    try {
      const waiting = `_Sedang mencari informasi Subdomain untuk ${text}..._`;
      m.reply(waiting);
      let data = await Api.get('/api/tools/subdomain-finder', { query: text })
        .then((result) => result.json())
        .then((response) => {
          if (response.status && response.code === 200) {
            let subdomains = response.result;
            if (subdomains.length > 0) {
              let message = `Subdomain untuk ${text}:\n\n` + subdomains.map((sub, i) => `${i + 1}. ${sub}`).join('\n');
              m.reply(message);
            } else {
              m.reply('Tidak ditemukan subdomain untuk domain ini.');
            }
          } else {
            m.reply('Terjadi kesalahan saat mengambil data subdomain. Silakan coba lagi nanti.');
          }
        })
        .catch((error) => {
          m.reply('Terjadi error saat mencari informasi Subdomain, silakan coba lagi nanti');
        });
    } catch (error) {
      m.reply('Terjadi error saat mencari informasi Subdomain, silakan coba lagi nanti');
    }
  }
};

export default handler;
