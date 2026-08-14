let timeout = 100000;
let poin = 10000;
const handler = {
  help: ['tebakkode'],
  tags: ['game'],
  command: /^tebakkode/i,
  register: false,
  group: true,
  run: async (m, { conn, usedPrefix, Api }) => {
    conn.tebakkode = conn.tebakkode ? conn.tebakkode : {};
    let id = m.chat;
    if (id in conn.tebakkode) {
      conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakkode[id][0]);
      throw false;
    }
    // di sini dia ngambil data dari api
    let src = await (await Api.get('/api/game/tebakkode')).json();
    let json = src;
    // buat caption buat di tampilin di wa
    let options = json.pilihan.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n');
    let caption = `
${json.soal}

${options}

┌─⊷ *SOAL*
▢ Bahasa: *${json.bahasa}*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Bonus: ${poin} money
▢ Ketik ${usedPrefix}kdo untuk clue jawaban
▢ *Balas/ reply soal ini untuk menjawab dengan a, b, c, atau d*
└──────────────
`.trim();
    conn.tebakkode[id] = [
      await conn.reply(m.chat, caption, m),
      json,
      poin,
      setTimeout(() => {
        if (conn.tebakkode[id]) {
          conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.tebakkode[id][0]);
          delete conn.tebakkode[id]; // Automatically delete the question
        }
      }, timeout)
    ];
  }
};

export default handler;

// tested di bileys versi 6.5.0 dan sharp versi 0.30.5
// danaputra133
