let timeout = 100000;
let poin = 10000;
const handler = {
  help: ['tebakkata'],
  tags: ['game'],
  command: /^tebakkata/i,
  register: false,
  group: true,
  run: async (m, { conn, usedPrefix, Api }) => {
    conn.tbkata = conn.tbkata ? conn.tbkata : {};
    let id = m.chat;
    if (id in conn.tbkata) {
      conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tbkata[id][0]);
      throw false;
    }
    // di sini dia ngambil data dari api
    let src = await (await Api.get('/api/game/tebakkata')).json();
    let json = src;
    // buat caption buat di tampilin di wa
    let caption = `
${json.soal}

┌─⊷ *SOAL*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Ketik ${usedPrefix}tkaa untuk bantuan
▢ Bonus: ${poin} money
▢ *Balas/ Reply soal ini untuk menjawab*
└──────────────
`.trim();
    conn.tbkata[id] = [
      await conn.reply(m.chat, caption, m),
      json,
      poin,
      setTimeout(() => {
        if (conn.tbkata[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.tbkata[id][0]);
        delete conn.tbkata[id];
      }, timeout)
    ];
  }
};

export default handler;

// tested di bileys versi 6.5.0 dan sharp versi 0.30.5
// danaputra133
