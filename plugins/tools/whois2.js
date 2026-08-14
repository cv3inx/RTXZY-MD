import fetch from 'node-fetch';
const handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    throw `Masukkan Domain/Sub Domain!\n\n*Contoh:* botcahx.eu.org`;
  }
  if (text.includes('https://') || text.includes('http://')) {
    throw `Tolong masukkan domain/sub domain secara lengkap. Contoh: botcahx.eu.org`;
  }
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Token=${global.whoisJsonKey}`
    }
  };
  try {
    const response = await fetch(`https://whoisjson.com/api/v1/whois?domain=${text}`, options);
    const data = await response.json();
    m.reply(JSON.stringify(data));
  } catch (error) {
    console.error(error);
    m.reply(global.eror || 'Error');
  }
};
handler.command = ['whois2'];
handler.tags = ['internet'];
handler.premium = false;
export default handler;
