let timeout = 100000;
let poin = 10000;
const handler = {
  help: ['tebakkpop'],
  tags: ['game'],
  command: 'tebakkpop',
  limit: false,
  group: true,
  run: async (m, { conn, usedPrefix, Api }) => {
    conn.tebakkpop = conn.tebakkpop ? conn.tebakkpop : {};
    let id = m.chat;
    if (id in conn.tebakkpop) {
      conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakkpop[id][0]);
      throw false;
    }
    let src = await (await Api.get('/api/game/tebakpop')).json();
    let json = src;
    if (!json) throw 'Terjadi kesalahan, ulangi lagi perintah!';
    let caption = `
≡ _GAME TEBAK KPOP_

┌─⊷ *SOAL*
▢ Penjelasan: *${json.deskripsi}*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Ketik ${usedPrefix}kpp untuk clue jawaban
▢ *REPLY* pesan ini untuk\nmenjawab
└──────────────

    `.trim();
    conn.tebakkpop[id] = [
      await conn.sendMessage(m.chat, { image: { url: json.img }, caption: caption }, { quoted: m }),
      json,
      poin,
      setTimeout(() => {
        if (conn.tebakkpop[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.tebakkpop[id][0]);
        delete conn.tebakkpop[id];
      }, timeout)
    ];
  }
};

export default handler;
