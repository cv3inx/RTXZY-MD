import fetch from 'node-fetch';

const handler = {
  help: ['xnxxsearch'],
  command: ['xnxxsearch'],
  tags: ['internet'],
  limit: true,
  premium: true,
  run: async (m, { text, usedPrefix, command }) => {
    if (!text) {
      throw `Contoh:\n${usedPrefix + command} Big boobs`;
    }
    try {
      const search = await fetch(`https://api.botcahx.eu.org/api/search/xnxx?query=${text}&apikey=${btc}`);
      const hasil = await search.json();

      let teks = `*XNXX RESULTS* \n\n🔍 *KEYWORDS* *${text}*\n\n`;
      let no = 1;

      for (let i of hasil.result) {
        teks += `📑 *No* : ${no++}\n📚 *Title* : ${i.title}\n⏱️ *Duration* : ${i.duration}\n🔗 *URL* ${i.link}\n\n─────────────────\n\n`;
      }

      await conn.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key } });
      await conn.sendMessage(m.chat, { image: { url: hasil.result[0].thumb }, caption: teks }, { quoted: m });
    } catch (e) {
      throw `Can't find data!`;
    }
  }
};

export default handler;
