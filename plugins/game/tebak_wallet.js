let timeout = 100000;
let poin = 10000;
const handler = {
  help: ['tebakwallet'],
  tags: ['game'],
  command: /^tebakwallet/i,
  register: false,
  group: true,
  run: async (m, { conn, usedPrefix, Api }) => {
    conn.tebakwallet = conn.tebakwallet ? conn.tebakwallet : {};
    let id = m.chat;
    if (id in conn.tebakwallet) {
      conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebakwallet[id][0]);
      throw false;
    }
    // di sini dia ngambil data dari api
    let src = await (await Api.get('/api/game/tebakwallet')).json();
    let json = src;
    // buat caption buat di tampilin di wa
    let caption = `
${json.soal}

┌─⊷ *SOAL*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Ketik ${usedPrefix}twa untuk bantuan
▢ Bonus: ${poin} money
▢ *Balas/ reply soal ini untuk menjawab*
└──────────────
`.trim();
    conn.tebakwallet[id] = [
      await conn.reply(m.chat, caption, m),
      json,
      poin,
      setTimeout(() => {
        if (conn.tebakwallet[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.tebakwallet[id][0]);
        delete conn.tebakwallet[id];
      }, timeout)
    ];
  }
};

export default handler;

// tested di bileys versi 6.7.9 dan sharp versi 0.30.5
// danaputra133
