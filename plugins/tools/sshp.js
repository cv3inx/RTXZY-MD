const __dirname = import.meta.dirname;
import fs from 'fs';
import path from 'path';
const handler = {
  help: ['sshp', 'sshandphone', 'sstablet'],
  tags: ['tools'],
  command: ['sshp', 'sshandphone', 'sstablet'],
  limit: true,
  fail: null,
  run: async (m, { conn, command, args, Api }) => {
    if (!args[0]) return conn.reply(m.chat, 'Input URL!', m);
    if (args[0].match(/xnxx\.com|hamster\.com|nekopoi\.care/i)) {
      return conn.reply(m.chat, 'Link tersebut dilarang!', m);
    }

    await m.reply('_Ｌｏａｄｉｎｇ．．._');

    // Check if the URL starts with 'http' or 'https'
    var url = args[0].startsWith('http') ? args[0] : 'https://' + args[0];

    try {
      var img = await Api.get('/api/tools/sshp', { url });
      if (!img) {
        await m.reply('Gagal saat percobaan pertama. Memulai percobaan kedua...');
        img = await Api.get('/api/tools/sshp', { url });
        if (!img) return conn.reply(m.chat, 'Gambar tidak tersedia', m);
      }
      var filepath = path.join(__dirname, '../tmp/') + +new Date() + '.jpeg';
      if (!fs.existsSync(path.join(__dirname, '../tmp/'))) fs.mkdirSync(path.join(__dirname, '../tmp/'));
      const dest = fs.createWriteStream(filepath);
      dest.on('finish', () => {
        conn
          .sendFile(m.chat, filepath, 'screenshot.jpeg', 'Nih gambarnya.', m)
          .then(() => {
            // Do nothing on success
          })
          .catch(() => {});
      });
      img.body.pipe(dest);

      // save file
      img.body.pipe(fs.createWriteStream(filepath));
    } catch (e) {
      console.log(e);
      conn.reply(m.chat, `Terjadi error!`, m);
    }
  }
};

export default handler;
