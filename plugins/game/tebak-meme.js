let timeout = 100000;
let poin = 10000;
import fetch from 'node-fetch';
const handler = {
  help: ['tebakmeme'],
  tags: ['game'],
  command: 'tebakmeme',
  limit: false,
  group: true,
  run: async (m, { conn, usedPrefix, Api }) => {
    conn.tebakmeme = conn.tebakmeme ? conn.tebakmeme : {};
    let id = m.chat;
    if (id in conn.tebakmeme) {
      conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakmeme[id][0]);
      throw false;
    }
    let src = await (await Api.get('/api/game/tebakmeme')).json();
    let json = src;
    if (!json) throw 'Terjadi kesalahan, ulangi lagi perintah!';
    let caption = `
  ≡ _GAME TEBAK MEME_

  ┌─⊷ *SOAL*
  ▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
  ▢ Bonus: ${poin} money
  ▢ Hint: ${json.Hint}
  ▢ *REPLAY* pesan ini untuk\nmenjawab
  └──────────────
      `.trim();
    let caption2 = `Waktu habis!\nJawabannya adalah *${json.Jawaban}*`;
    conn.tebakmeme[id] = [
      await conn.sendMessage(m.chat, { image: { url: json.imgFilter }, caption: caption }, { quoted: m }),
      json,
      poin,
      setTimeout(() => {
        if (conn.tebakmeme[id]) conn.sendMessage(m.chat, { image: { url: json.Img }, caption: caption2 }, { quoted: m }, conn.tebakmeme[id][0]);
        delete conn.tebakmeme[id];
      }, timeout)
    ];
  }
};

export default handler;
