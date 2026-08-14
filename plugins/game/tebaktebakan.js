let timeout = 100000;
let poin = 10000;
const handler = {
  help: ['tebaktebakan'],
  tags: ['game'],
  command: 'tebaktebakan',
  register: false,
  group: true,
  run: async (m, { conn, usedPrefix, Api }) => {
    conn.tebaktebakan = conn.tebaktebakan ? conn.tebaktebakan : {};
    let id = m.chat;
    if (id in conn.tebaktebakan) {
      conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini', conn.tebaktebakan[id][0]);
      throw false;
    }
    // di sini dia ngambil data dari api
    let src = await (await Api.get('/api/game/tebaktebakan')).json();
    let json = src;
    // buat caption buat di tampilin di wa
    let caption = `
${json.soal}

┌─⊷ *SOAL*
▢ Timeout *${(timeout / 1000).toFixed(2)} detik*
▢ Ketik ${usedPrefix}tika untuk bantuan
▢ Bonus: ${poin} money
▢ *Balas/ REPLY soal ini untuk menjawab*
└──────────────
`.trim();
    conn.tebaktebakan[id] = [
      await conn.reply(m.chat, caption, m),
      json,
      poin,
      setTimeout(() => {
        if (conn.tebaktebakan[id]) conn.reply(m.chat, `Waktu habis!\nJawabannya adalah *${json.jawaban}*`, conn.tebaktebakan[id][0]);
        delete conn.tebaktebakan[id];
      }, timeout)
    ];
  }
};

export default handler;

// tested di bileys versi 6.5.0 dan sharp versi 0.30.5
// danaputra133
