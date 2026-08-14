const handler = {
  help: ['pinterest <keyword>'],
  tags: ['internet'],
  command: /^(pinterest)$/i,
  run: async (m, { usedPrefix, command, conn, text, Api }) => {
    if (!text) throw `*🚩 Example:* ${usedPrefix}${command} Zhao Lusi`;
    m.reply(wait);
    try {
      let response = await Api.get('/api/search/pinterest', { text1: text });
      let data = await response.json();
      let old = new Date();
      let limit = Math.min(5, data.result.length);
      for (let i = 1; i < limit; i++) {
        await sleep(3000);
        conn.sendFile(m.chat, data.result[i], 'pin.jpg', `🍟 *Fetching* : ${(new Date() - old) * 1} ms`, m);
      }
    } catch (e) {
      throw eror;
    }
  }
};

export default handler;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
