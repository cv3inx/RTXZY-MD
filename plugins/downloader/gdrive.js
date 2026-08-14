const handler = {
  command: ['gdrive', 'gdrivedl'],
  help: ['gdrive', 'gdrivedl'],
  tags: ['downloader'],
  limit: true,
  run: async (m, { text, usedPrefix, command, Api }) => {
    if (!text) throw `*Example:* ${usedPrefix + command} https://drive.google.com/file/d/1thDYWcS5p5FFhzTpTev7RUv0VFnNQyZ4/view?usp=drivesdk`;
    m.reply(wait);
    try {
      let json = await Api.get('/api/download/gdrive', { url: text }).then((res) => res.json());
      conn.sendMessage(m.chat, { document: { url: json.result.data }, fileName: json.result.fileName, mimetype: json.result.mimetype }, { quoted: m });
    } catch (e) {
      throw `Error: ${eror}`;
    }
  }
};
export default handler;
