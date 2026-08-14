let timeout = 100000;
let poin = 10000;
const handler = {
  help: ['tebaklirik'],
  tags: ['game'],
  command: /^tebaklirik/i,
  register: false,
  group: true,
  run: async (m, { conn, usedPrefix, Api }) => {
    conn.tebaklirik = conn.tebaklirik ? conn.tebaklirik : {};
    let id = m.chat;
    if (id in conn.tebaklirik) {
      conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebaklirik[id][0]);
      throw false;
    }
    // di sini dia ngambil data dari api
    let src = await (await Api.get('/api/game/tebaklirik')).json();
    let json = src;
    // buat caption buat di tampilin di wa
    let caption = `
${json.question}

┌─⊷ *SOAL*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Ketik ${usedPrefix}liga untuk bantuan
▢ Bonus: ${poin} money
▢ *Balas/ REPLY soal ini untuk menjawab*
└──────────────
`.trim();
    conn.tebaklirik[id] = [
      await conn.reply(m.chat, caption, m),
      json,
      poin,
      setTimeout(() => {
        if (conn.tebaklirik[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.answer}*`, conn.tebaklirik[id][0]);
        delete conn.tebaklirik[id];
      }, timeout)
    ];
  }
};

export default handler;

// tested di bileys versi 6.5.0 dan sharp versi 0.30.5
// danaputra133
