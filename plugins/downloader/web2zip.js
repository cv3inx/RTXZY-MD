const handler = {
  help: ['web2zip'],
  usage: 'url',
  tags: ['downloader'],
  command: ['web2zip', 'w2z'],
  limit: true,
  run: async (m, { conn, args, usedPrefix, command, Api }) => {
    if (!args[0]) throw `*Example:* ${usedPrefix}${command} https://www.google.com`;

    await m.reply('⏳ Mohon tunggu, sedang membuat ZIP dari website...');

    try {
      const response = await Api.get('/api/tools/web2zip', { url: args[0] });
      const json = await response.json();

      if (!json.status || !json.result) throw '❌ Gagal membuat ZIP dari website!';

      let zipUrl = json.result;

      let caption = `
🌐 Website: ${args[0]}
🗂 ZIP URL: ${zipUrl}
`.trim();

      await m.reply(caption);
      await conn.sendMessage(
        m.chat,
        {
          document: { url: zipUrl },
          mimetype: 'application/zip',
          fileName: `web2zip_${Date.now()}.zip`
        },
        { quoted: m }
      );
    } catch (e) {
      console.error(e);
      throw eror;
    }
  }
};

export default handler;
