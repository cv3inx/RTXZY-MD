import fetch from 'node-fetch';
const handler = {
  command: ['twitter', 'twitdl', 'twitterdl'],
  help: ['twitter', 'twitdl', 'twitterdl'],
  tags: ['downloader'],
  limit: true,
  group: false,
  premium: false,
  owner: false,
  admin: false,
  botAdmin: false,
  fail: null,
  private: false,
  run: async (m, { conn, args, usedPrefix, command, Api }) => {
    if (!args[0]) throw `Masukkan URL!\n\ncontoh:\n${usedPrefix + command} https://twitter.com/gofoodindonesia/status/1229369819511709697`;
    if (!args[0].match(/https?:\/\/(www\.)?(twitter\.com|x\.com)/gi)) throw 'URL Tidak Ditemukan!';
    m.reply(wait);
    try {
      const api = await Api.get('/api/download/twitter2', { url: args[0] });
      const res = await api.json();
      const mediaURLs = res.result.mediaURLs;

      const capt = `*Username: ${res.result.user_name} ${res.result.user_screen_name}*\n*Title: ${res.result.text}*\n*Replies: ${res.result.replies}*\n*Retweet: ${res.result.retweets}*`;

      for (const url of mediaURLs) {
        const response = await fetch(url);
        const buffer = await response.buffer();
        await delay(3000);
        conn.sendFile(m.chat, buffer, null, capt, m);
      }
    } catch (e) {
      throw '*Server Down!*';
    }
  }
};

export default handler;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
