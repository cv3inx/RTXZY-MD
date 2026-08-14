import fetch from 'node-fetch';
const handler = {
  tags: ['internet'],
  help: ['wallpapersearch'],
  usage: 'kata kunci',
  command: ['wallpapersearch', 'wps'],
  limit: true,
  run: async (m, { conn, text, usedPrefix, command, Api }) => {
    if (!text) throw `Contoh: ${usedPrefix + command} game`;

    try {
      await m.reply(wait);
      let response = await Api.get('/api/search/wallpaper', { text1: text });
      let data = await response.json();

      if (!data.result || data.result.length === 0) throw 'Tidak ada wallpaper ditemukan';

      let wallpaper = data.result[Math.floor(Math.random() * data.result.length)];
      let img = await (await fetch(wallpaper.image)).buffer();

      let caption = `🎨 HASIL PENCARIAN WALLPAPER\n\n` + `📌 Kata Kunci: ${text}\n` + `🖼️ Tipe: ${wallpaper.type || 'Tidak diketahui'}\n` + `📎 Sumber: ${wallpaper.source || 'Tidak tersedia'}\n` + `📊 Total Ditemukan: ${data.result.length} wallpaper\n\n` + `✨ Wallpaper random dari hasil pencarian!`;

      await conn.sendMessage(
        m.chat,
        {
          image: img,
          caption: caption
        },
        { quoted: m }
      );
    } catch (e) {
      throw eror;
    }
  }
};

export default handler;
