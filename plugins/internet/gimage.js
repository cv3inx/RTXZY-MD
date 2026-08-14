const handler = {
  help: ['gimage', 'image'],
  usage: 'query',
  tags: ['internet'],
  command: ['gimage', 'image'],
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `Use example ${usedPrefix}${command} Minecraft`;
    try {
      const res = await (await Api.get('/api/search/googleimage', { text1: text })).json();
      if (!res.status) throw eror;
      let image = pickRandom(res.result).url;
      conn.sendFile(m.chat, image, 'google.jpg', `*G O O G L E*\n*Result:* ${text}\n*Source:* https://google.com`, m);
    } catch (e) {
      throw eror;
    }
  }
};

export default handler;

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
