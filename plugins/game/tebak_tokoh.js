let timeout = 100000;
let poin = 10000;
let src;
import fs from 'fs';
const handler = {
  help: ['tebaktokoh'],
  tags: ['game'],
  command: /^tebaktokoh/i,
  limit: false,
  group: true,
  run: async (m, { conn, usedPrefix, Api }) => {
    conn.tebaktokoh = conn.tebaktokoh ? conn.tebaktokoh : {};
    let id = m.chat;
    if (id in conn.tebaktokoh) {
      conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebaktokoh[id][0]);
      throw false;
    }
    let src = await (await Api.get('/api/game/tebaknamatokoh')).json();
    let json = src;
    let caption = `
≡ _GAME TEBAK TOKOH_ ≡ 
${json.soal}

┌─⊷ *SOAL*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Ketik ${usedPrefix}tbok untuk clue jawaban
▢ *REPLY* pesan ini untuk\nmenjawab
└──────────────

    `.trim();
    conn.tebaktokoh[id] = [
      await conn.sendMessage(m.chat, { image: { url: json.img }, caption: caption }, { quoted: m }),
      json,
      poin,
      setTimeout(() => {
        if (conn.tebaktokoh[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.tebaktokoh[id][0]);
        delete conn.tebaktokoh[id];
      }, timeout)
    ];
  }
};

export default handler;
