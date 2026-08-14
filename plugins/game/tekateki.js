import fs from 'fs';
let timeout = 100000;
let poin = 10000;
const handler = {
  help: ['tekateki'],
  tags: ['game'],
  command: 'tekateki',
  group: true,
  run: async (m, { conn, usedPrefix, Api }) => {
    conn.tekateki = conn.tekateki ? conn.tekateki : {};
    let id = m.chat;
    if (id in conn.tekateki) {
      if (conn.tekateki[id].length !== 0) return conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tekateki[id][0]);
      delete conn.tekateki[id];
      throw false;
    }
    conn.tekateki[id] = [];
    let src = await (await Api.get('/api/game/tekateki')).json();
    let json = src;

    let caption = `
*TEKA TEKI*

${json.data.pertanyaan}
┌─⊷ *SOAL*
▢ Waktu jawab *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Bantuan ${usedPrefix}tete
▢ *Balas/ REPLY soal ini untuk menjawab*
└──────────────
`.trim();
    conn.tekateki[id] = [
      await conn.reply(m.chat, caption, m),
      json,
      poin,
      setTimeout(() => {
        if (conn.tekateki[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.data.jawaban}*`, conn.tekateki[id][0]);
        delete conn.tekateki[id];
      }, timeout)
    ];
  }
};

export default handler;
