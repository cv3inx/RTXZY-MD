const handler = {
  command: ['randomgore', 'gore'],
  help: ['randomgore', 'gore'],
  tags: ['downloader'],
  limit: true,
  run: async (m, { conn, Api }) => {
    try {
      m.reply(wait);
      let res = await (await Api.get('/api/webzone/gore')).json();
      let capt = `*R A N D O M   G O R E*\n\n`;
      capt += `  ◦  *Title*: ${res.result.title}\n`;
      capt += `  ◦  *Author*: ${res.result.author}\n`;
      capt += `  ◦  *Views*: ${res.result.views}\n`;
      capt += `  ◦  *Comment*: ${res.result.comments}\n`;
      conn.sendFile(m.chat, res.result.url, null, capt, m);
    } catch (error) {
      throw eror;
    }
  }
};

export default handler;
