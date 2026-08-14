const handler = {
  help: ['motivasi'],
  tags: ['quotes'],
  command: /^(motivasi)$/i,
  run: async (m, { conn, Api }) => {
    try {
      let res = await Api.get('/api/random/motivasi');
      let json = await res.json();
      conn.reply(m.chat, `―MOTIVASI―\n\n"${json.result}"`);
    } catch (e) {
      throw `Internal server eror!`;
    }
  }
};

export default handler;
